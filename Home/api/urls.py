from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, BlogDetailViewSet, WorkItemViewSet
from ..views import work_items_api

router = DefaultRouter()
router.register(r'blog-posts', BlogPostViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('work-items/', work_items_api, name='work_items_api'),
]