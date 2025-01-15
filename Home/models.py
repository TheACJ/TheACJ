from django.db import models


class Contact(models.Model):
    name = models.CharField(max_length=250, null=False, blank=False)
    email = models.EmailField(max_length=250, null=False, blank=False)
    subject = models.CharField(max_length=250)
    message = models.TextField(null=False, blank=False, max_length=1024)

    def __str__(self):
        return self.name


class Category(models.Model):

    class Meta:
        verbose_name_plural = 'Categories'

    name = models.CharField(max_length=254)
    friendly_name = models.CharField(max_length=254, null=True, blank=True)

    def __str__(self):
        return self.name

    def get_friendly_name(self):
        return self.friendly_name


class BlogPost(models.Model):
    category = models.ForeignKey('Category', null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=20)
    content = models.TextField(max_length=1024)
    date_published = models.DateTimeField(auto_now_add=True)
    image_url = models.URLField(max_length=1024, null=True, blank=True)
    image = models.ImageField(null=True, blank=True)
    link = models.URLField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return self.title

class WorkItem(models.Model):
    title = models.CharField(max_length=20)
    category = models.CharField(max_length=20, null=True, blank=True)
    image = models.ImageField(upload_to='work_images/', blank=True, null=True)
    description = models.TextField(max_length=1024)
    link = models.URLField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return self.title