from django.contrib import admin
from .models import BlogPost, Category

# Register your models here.

class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        'title',        
        'content',
        'category',
        'image',
        'date_published',
        'image_url',
    )

    ordering = ('category',)

class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'friendly_name',
        'name',
    )

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Category, CategoryAdmin)
# Register your models here.
