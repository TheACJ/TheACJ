from django.conf import settings
from django.shortcuts import render, redirect,  get_object_or_404
from django.core.mail import send_mail
from django.contrib import messages
import csv
from django.http import JsonResponse
from django.core.serializers import serialize
from .forms import ContactForm, BlogPostForm
from .models import BlogPost, Contact, WorkItem    # Import your BlogPost model


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
    
def blog_posts_api(request):
    posts = BlogPost.objects.all().order_by('-date_published')
    data = []
    for post in posts:
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'date_published': post.date_published,
            'image': request.build_absolute_uri(post.image.url) if post.image else None,
            'category': {
                'name': post.category.name,
                'friendly_name': post.category.friendly_name
            } if post.category else None
        })
    return JsonResponse(data, safe=False)

def blog_detail_api(request, id):
    post = get_object_or_404(BlogPost, id=id)
    data = {
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'date_published': post.date_published,
        'image': request.build_absolute_uri(post.image.url) if post.image else None,
        'category': {
            'name': post.category.name,
            'friendly_name': post.category.friendly_name
        } if post.category else None
    }
    print(f"Response data: {data}")
    return JsonResponse(data)

def work_items_api(request):
    posts = WorkItem.objects.all().order_by('id')
    data = []
    for post in posts:
        data.append({
            'id': post.id,
            'title': post.title,
            'category': post.category,
            'description': post.description,
            'image': request.build_absolute_uri(post.image.url) if post.image else None
            })
    return JsonResponse(data, safe=False)
