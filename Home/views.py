from django.conf import settings
from django.shortcuts import render, redirect,  get_object_or_404
from django.core.mail import send_mail
from django.contrib import messages
import csv
from django.http import HttpResponse, JsonResponse
from django.core.serializers import serialize
from .forms import ContactForm, BlogPostForm
from .models import BlogPost, Contact, WorkItem, Category    # Import your BlogPost model
from django.views.decorators.csrf import ensure_csrf_cookie,csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import WorkItemSerializer, BlogPostSerializer, CategorySerializer
from rest_framework.parsers import JSONParser, MultiPartParser
import json
import os
from datetime import datetime

@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

def index(request):
    # Retrieve recent blog posts from the database
    recent_posts = BlogPost.objects.order_by('-date_published')[:3]
    
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():

            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']

            form.save()

            try:
                # Send email code here
                messages.success(request, 'Your message has been sent successfully!')
            except Exception as e:
                messages.error(request, f'Error sending email: {str(e)}')

                # Write form data to CSV
                with open('responses.csv', 'a', newline='') as csvfile:
                    fieldnames = ['Name', 'Email', 'Subject', 'Message']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writerow({'Name': name, 'Email': email, 'Subject': subject, 'Message': message})
                
                # Display error message
                messages.error(request, 'There was an error sending your message. Please try again.')
    else:
        form = ContactForm()

    return render(request, 'Home/index.html', {'form': form, 'recent_posts': recent_posts})


def success(request):
    return HttpResponse('Success!')

def add_blog_post(request):
    if request.method == 'POST':
        form = BlogPostForm(request.POST, request.FILES)  # Include request.FILES
        if form.is_valid():
            form.save()
            messages.success(request, 'Blog post created successfully!')
            return redirect('Home:index')  # Redirect to the index page after successful submission
        else:
            messages.error(request, 'Error creating blog post. Please check the form.')
    else:
        form = BlogPostForm()
    return render(request, 'Home/add_blog_post.html', {'form': form})
    
@require_http_methods(["GET"])  
def blog_posts_api(request):
    posts = BlogPost.objects.all().order_by('-date_published')
    data = [
        {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'date_published': post.date_published,
            'image': request.build_absolute_uri(post.image.url) if post.image else None,
            'category': {
                'name': post.category.name,
                'friendly_name': post.category.friendly_name,
            } if post.category else None,
            }
            for post in posts
        ]
    return JsonResponse(data, safe=False)

@api_view(['POST'])
def add_blog_post(request):
        serializer =  BlogPostSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return JsonResponse(serializer.data, safe=False)

@require_http_methods(["GET"])  # Only allow GET and POST requests
def work_items_api(request):
        posts = WorkItem.objects.all().order_by('id')
        data = []
        for post in posts:
            data.append({
                'id': post.id,
                'title': post.title,
                'category': post.category,
                'description': post.description,
                'image': request.build_absolute_uri(post.image.url) if post.image else None,
                'link': post.link
            })
        return JsonResponse(data, safe=False)

@api_view(['POST'])
def create_work_item(request):
        serializer = WorkItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
@csrf_exempt
def contact_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = ContactForm(data)
            
            if form.is_valid():
                # Save to database
                contact = form.save()
                
                # Save to CSV
                csv_file = os.path.join(settings.BASE_DIR, 'responses.csv')
                file_exists = os.path.exists(csv_file)
                
                with open(csv_file, 'a', newline='') as csvfile:
                    fieldnames = ['Date', 'Name', 'Email', 'Subject', 'Message']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    
                    if not file_exists:
                        writer.writeheader()
                    
                    writer.writerow({
                        'Date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        'Name': data['name'],
                        'Email': data['email'],
                        'Subject': data['subject'],
                        'Message': data['message']
                    })
                
                # Send email
                email_body = f"""
                New Contact Form Submission:
                
                Name: {data['name']}
                Email: {data['email']}
                Subject: {data['subject']}
                Message:
                {data['message']}
                """
                
                send_mail(
                    subject=f"New Contact Form: {data['subject']}",
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=['agbaijoshua@theacj.com.ng'],
                    fail_silently=False,
                )
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Your message has been sent successfully!'
                })
            
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid form data',
                'errors': form.errors
            }, status=400)
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
    
    return JsonResponse({
        'status': 'error',
        'message': 'Method not allowed'
    }, status=405)