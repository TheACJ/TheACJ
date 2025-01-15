from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import success, csrf_token_view

app_name = 'Home'
urlpatterns = [
    path('', views.index, name='index'),
    path('add/', views.add_blog_post, name='add_blog_post'),
    path('success/', success, name='success'),
    path('api/blog-posts/', views.blog_posts_api, name='blog_posts_api'),
    path('api/works/', views.work_items_api, name='work_items_api'),
    path('api/worksadd/', views.create_work_item, name='create_work_item'),
    path('api/blogsadd/', views.add_blog_post, name='add_blog_post'),
    path('api/csrf/', csrf_token_view, name='csrf_token'),
    path('api/categories/', views.get_categories, name='get_categories'),

    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
