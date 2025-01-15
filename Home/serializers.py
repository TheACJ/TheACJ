from rest_framework import serializers
from .models import BlogPost, Category, WorkItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'friendly_name']

class BlogPostSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    
    class Meta:
        model = BlogPost
        fields = '__all__'

class BlogDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'date_published', 'image', 'category']

class WorkItemSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = WorkItem
        fields = ['id', 'title', 'description', 'category', 'link', 'image']
    
    def create(self, validated_data):
        image_file = validated_data.pop('image_file', None)
        work_item = WorkItem.objects.create(**validated_data)
        if image_file:
            work_item.image = image_file
            work_item.save()
        return work_item

    def update(self, instance, validated_data):
        image_file = validated_data.pop('image_file', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if image_file:
            instance.image = image_file
        instance.save()
        return instance
    