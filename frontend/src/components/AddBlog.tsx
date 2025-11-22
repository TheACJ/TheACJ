import React, { useState, useEffect } from 'react';
import { blogService, categoryService, type Category } from '../services/api_node';

const BlogPostForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogService.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoriesError('Failed to load categories. Please refresh the page.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError('');
    
      try {
        const form = e.target as HTMLFormElement;
        const formData = new FormData();

        // Add text fields
        formData.append('title', form.title.value);
        formData.append('category', form.category.value);
        formData.append('content', form.content.value);
        if (form.link.value) {
          formData.append('link', form.link.value);
        }

        // Add image file if selected
        if (selectedFile) {
          formData.append('image', selectedFile);
        }

        // Set the correct content type header for multipart/form-data
        await blogService.createPost(formData);
      
        // Reset form and preview
        form.reset();
        setPreview('');
        setSelectedFile(null);
      
        // Show success message
        alert('Blog post created successfully!');
      } catch (error) {
        console.error('Error creating blog post:', error);
        setError('Failed to create blog post. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Blog Post</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            maxLength={20}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="Enter post title"
          />
        </div>

        {/* Category Field */}
        <div>
          <label 
            htmlFor="category" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          {categoriesError ? (
            <div className="text-red-600 text-sm mb-2">
              {categoriesError}
            </div>
          ) : (
            <select
              id="category"
              name="category"
              required
              disabled={isCategoriesLoading}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors
                ${isCategoriesLoading ? 'bg-gray-100' : ''}`}
            >
              <option value="">
                {isCategoriesLoading ? 'Loading categories...' : 'Select a category'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.friendly_name || category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content Field */}
        <div>
          <label 
            htmlFor="content" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            maxLength={1024}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="Write your blog post content..."
          />
        </div>

        {/* External Link Field */}
        <div>
          <label 
            htmlFor="link" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            External Link (Optional)
          </label>
          <input
            type="url"
            id="link"
            name="link"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder="https://..."
          />
        </div>

        {/* Image Upload Field */}
        <div>
          <label 
            htmlFor="image" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isCategoriesLoading || !!categoriesError}
          className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors
            ${(isSubmitting || isCategoriesLoading || !!categoriesError)
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </span>
          ) : (
            'Publish Post'
          )}
        </button>
      </form>
    </div>
  );
};

export default BlogPostForm;