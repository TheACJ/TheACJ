from django import forms
from .models import BlogPost
from .models import Category
from .models import Contact
from .widgets import CustomClearableFileInput
from django.forms.widgets import TextInput, Textarea


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ('name', 'email', 'subject', 'message')
        widget = {
            'name': TextInput(attrs={"placeholder": "Your Name"}),
            'email': TextInput(attrs={"placeholder": "Your Email"}),
            'subject': TextInput(attrs={"placeholder": "Subject"}),
            'message': Textarea(attrs={"placeholder": "Your message"}),
        }
    

class BlogPostForm(forms.ModelForm):
    class Meta:
        model = BlogPost
        fields = '__all__'
        # fields = ['title', 'content', 'category', 'image']  # Add other fields as needed
        image = forms.ImageField(
            label='Image',
            required=True,
            widget=CustomClearableFileInput)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        categories = Category.objects.all()
        friendly_names = [(c.id, c.get_friendly_name()) for c in categories]

        self.fields['category'].choices = friendly_names
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'border-black rounded-2'
