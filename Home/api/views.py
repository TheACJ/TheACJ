from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from ..models import BlogPost, WorkItem
from ..models import Contact
from ..serializers import BlogPostSerializer, BlogDetailSerializer ,WorkItemSerializer

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().order_by('-date_published')
    serializer_class = BlogPostSerializer


class BlogDetailViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogDetailSerializer

class WorkItemViewSet(viewsets.ModelViewSet):
    queryset = WorkItem.objects.all().order_by('id')
    serializer_class = WorkItemSerializer

""" class WorkItemListCreate(generics.ListCreateAPIView):
    queryset = WorkItem.objects.all()
    serializer_class = WorkItemSerializer
    parser_classes = (MultiPartParser, FormParser)

class WorkItemRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkItem.objects.all()
    serializer_class = WorkItemSerializer
    parser_classes = (MultiPartParser, FormParser) """

# class ContactViewSet(viewsets.ModelViewSet):
#     queryset = Contact.objects.all()
#     serializer_class = ContactSerializer