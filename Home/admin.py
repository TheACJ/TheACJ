from django.contrib import admin
from .models import BlogPost, Category, WorkItem

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

class WorkItemAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'category',
        'image',
        'description',
        'link',
    )

    ordering = ('category',)

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(WorkItem, WorkItemAdmin)
# Register your models here.
