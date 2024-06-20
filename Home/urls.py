from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import success
from .views import portfolio

app_name = 'Home'
urlpatterns = [
    path('', views.index, name='index'),
    path('portfolio/', portfolio, name='portfolio'),
    path('add/', views.add_blog_post, name='add_blog_post'),
    path('success/', success, name='success')
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
