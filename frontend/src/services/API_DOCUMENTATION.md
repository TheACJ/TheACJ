# The ACJ Portfolio API Client Documentation

A comprehensive TypeScript API client for The ACJ Portfolio Node.js backend. This client provides full access to all backend endpoints with proper authentication, error handling, and TypeScript support.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Services](#api-services)
- [Usage Examples](#usage-examples)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Installation & Setup

### 1. Import the API client

```typescript
// Import the complete API client
import { apiClient, authService, contentService, blogService } from './services/api_node';

// Or import specific services
import { authService } from './services/api_node';
import { contentService } from './services/api_node';
```

### 2. Configuration

The API URL is automatically configured from environment variables:

```typescript
// Environment variables (.env)
VITE_API_URL=http://localhost:5000/api

// Or use the default (http://localhost:5000/api)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## Configuration

### API Client Options

The `ApiClient` class constructor accepts a base URL:

```typescript
import { ApiClient, API_URL } from './services/api_node';

// Create a custom instance
const customApiClient = new ApiClient('https://your-api-url.com/api');
```

### Authentication Headers

The client automatically handles JWT tokens:
- Stores tokens in localStorage
- Adds Authorization headers to requests
- Handles token refresh automatically

## Authentication

### Login

```typescript
import { authService } from './services/api_node';

const login = async () => {
  try {
    const response = await authService.login({
      username: 'admin',
      password: 'password',
      rememberMe: true
    });

    if (response.success) {
      console.log('Login successful:', response.data);
      // User is now authenticated
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Check Authentication Status

```typescript
import { authService, apiClient } from './services/api_node';

// Check if user is authenticated
if (apiClient.isAuthenticated()) {
  // User is logged in
  const profile = await authService.getProfile();
}

// Verify token validity
const isValid = await authService.verifyToken();
```

### Update Profile

```typescript
const updateProfile = async () => {
  try {
    const response = await authService.updateProfile({
      email: 'newemail@example.com',
      fullName: 'Joshua Agbai'
    });

    if (response.success) {
      console.log('Profile updated:', response.data.admin);
    }
  } catch (error) {
    console.error('Profile update failed:', error.message);
  }
};
```

### Change Password

```typescript
const changePassword = async () => {
  try {
    await authService.changePassword({
      currentPassword: 'currentPassword',
      newPassword: 'newPassword'
    });
    console.log('Password changed successfully');
  } catch (error) {
    console.error('Password change failed:', error.message);
  }
};
```

### Logout

```typescript
const logout = async () => {
  try {
    await authService.logout();
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
};
```

## API Services

### Content Management

#### Get Public Content (Homepage Sections)

```typescript
import { contentService } from './services/api_node';

const loadHomepageContent = async () => {
  try {
    const response = await contentService.getPublicContent();
    
    if (response.success) {
      const { hero, about, services, counter, skills } = response.data;
      
      // Use content in your components
      console.log('Hero Section:', hero);
      console.log('About Section:', about);
      console.log('Services:', services);
      console.log('Counter:', counter);
      console.log('Skills:', skills);
    }
  } catch (error) {
    console.error('Failed to load content:', error.message);
  }
};
```

#### Admin Content Management

```typescript
// Get all content sections (admin only)
const getAllContent = async () => {
  const response = await contentService.getContentSections();
  return response.data.content;
};

// Update specific section
const updateHeroSection = async () => {
  const response = await contentService.updateContentSection('hero', {
    title: 'My New Title',
    subtitle: 'My new subtitle',
    description: 'My new description',
    // ... other hero properties
  });
  
  if (response.success) {
    console.log('Hero section updated');
  }
};

// Reset section to default
const resetAboutSection = async () => {
  await contentService.resetContentSection('about');
};
```

### Blog Posts

#### Public Blog API

```typescript
import { blogService } from './services/api_node';

// Get all blog posts
const getBlogPosts = async () => {
  try {
    const response = await blogService.getBlogPosts();
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load blog posts:', error.message);
  }
};

// Get single blog post
const getBlogPost = async (id: string) => {
  try {
    const response = await blogService.getBlogPost(id);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load blog post:', error.message);
  }
};
```

#### Admin Blog Management

```typescript
// Get all blog posts (admin)
const getAdminBlogPosts = async () => {
  const response = await blogService.getAdminBlogPosts();
  return response.data.blogPosts;
};

// Create new blog post
const createBlogPost = async (formData: BlogPostForm & { image?: File }) => {
  try {
    const response = await blogService.createBlogPost(formData);
    if (response.success) {
      console.log('Blog post created:', response.data.blogPost);
      return response.data.blogPost;
    }
  } catch (error) {
    console.error('Failed to create blog post:', error.message);
  }
};

// Update blog post
const updateBlogPost = async (id: string, formData: BlogPostForm & { image?: File }) => {
  try {
    const response = await blogService.updateBlogPost(id, formData);
    if (response.success) {
      console.log('Blog post updated:', response.data.blogPost);
      return response.data.blogPost;
    }
  } catch (error) {
    console.error('Failed to update blog post:', error.message);
  }
};

// Delete blog post
const deleteBlogPost = async (id: string) => {
  try {
    await blogService.deleteBlogPost(id);
    console.log('Blog post deleted');
  } catch (error) {
    console.error('Failed to delete blog post:', error.message);
  }
};
```

### Work Items

#### Public Work API

```typescript
import { workService } from './services/api_node';

// Get all work items
const getWorkItems = async () => {
  try {
    const response = await workService.getWorkItems();
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load work items:', error.message);
  }
};

// Get single work item
const getWorkItem = async (id: string) => {
  try {
    const response = await workService.getWorkItem(id);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load work item:', error.message);
  }
};
```

#### Admin Work Management

```typescript
// Get work items (admin)
const getAdminWorkItems = async () => {
  const response = await workService.getAdminWorkItems();
  return response.data.workItems;
};

// Create work item
const createWorkItem = async (formData: WorkItemForm) => {
  try {
    const response = await workService.createWorkItem(formData);
    if (response.success) {
      console.log('Work item created:', response.data.workItem);
      return response.data.workItem;
    }
  } catch (error) {
    console.error('Failed to create work item:', error.message);
  }
};

// Update work item
const updateWorkItem = async (id: string, formData: WorkItemForm) => {
  try {
    const response = await workService.updateWorkItem(id, formData);
    if (response.success) {
      console.log('Work item updated:', response.data.workItem);
      return response.data.workItem;
    }
  } catch (error) {
    console.error('Failed to update work item:', error.message);
  }
};

// Delete work item
const deleteWorkItem = async (id: string) => {
  try {
    await workService.deleteWorkItem(id);
    console.log('Work item deleted');
  } catch (error) {
    console.error('Failed to delete work item:', error.message);
  }
};
```

### Categories

#### Public Category API

```typescript
import { categoryService } from './services/api_node';

// Get all categories
const getCategories = async () => {
  const response = await categoryService.getCategories();
  return response.data;
};

// Get single category
const getCategory = async (id: string) => {
  const response = await categoryService.getCategory(id);
  return response.data;
};
```

#### Admin Category Management

```typescript
// Get categories by type (admin)
const getAdminCategories = async (type?: 'blog' | 'work') => {
  const response = await categoryService.getAdminCategories(type);
  return response.data.categories;
};

// Create category
const createCategory = async (formData: CategoryForm) => {
  try {
    const response = await categoryService.createCategory(formData);
    if (response.success) {
      console.log('Category created:', response.data.category);
      return response.data.category;
    }
  } catch (error) {
    console.error('Failed to create category:', error.message);
  }
};

// Update category
const updateCategory = async (id: string, formData: CategoryForm) => {
  try {
    const response = await categoryService.updateCategory(id, formData);
    if (response.success) {
      console.log('Category updated:', response.data.category);
      return response.data.category;
    }
  } catch (error) {
    console.error('Failed to update category:', error.message);
  }
};

// Delete category
const deleteCategory = async (id: string) => {
  try {
    await categoryService.deleteCategory(id);
    console.log('Category deleted');
  } catch (error) {
    console.error('Failed to delete category:', error.message);
  }
};
```

### Contacts

#### Public Contact Form

```typescript
import { contactService } from './services/api_node';

// Submit contact form
const submitContactForm = async (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await contactService.submitContact(formData);
    if (response.success) {
      console.log('Contact form submitted successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to submit contact form:', error.message);
    return false;
  }
};
```

#### Admin Contact Management

```typescript
// Get all contacts (admin)
const getContacts = async () => {
  const response = await contactService.getContacts();
  return response.data.contacts;
};

// Get single contact (admin)
const getContact = async (id: string) => {
  const response = await contactService.getContact(id);
  return response.data.contact;
};

// Delete contact (admin)
const deleteContact = async (id: string) => {
  try {
    await contactService.deleteContact(id);
    console.log('Contact deleted');
  } catch (error) {
    console.error('Failed to delete contact:', error.message);
  }
};
```

### Upload

```typescript
import { uploadService } from './services/api_node';

// Upload image
const uploadImage = async (file: File) => {
  try {
    const response = await uploadService.uploadImage(file);
    if (response.success) {
      console.log('Image uploaded:', response.data.url);
      return response.data.url;
    }
  } catch (error) {
    console.error('Failed to upload image:', error.message);
    return null;
  }
};
```

### Dashboard

```typescript
import { dashboardService } from './services/api_node';

// Get dashboard statistics
const getDashboardStats = async () => {
  const response = await dashboardService.getStats();
  return response.data;
};

// User management (super admin only)
const getUsers = async () => {
  const response = await dashboardService.getUsers();
  return response.data.users;
};

const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: 'admin' | 'super_admin';
}) => {
  const response = await dashboardService.createUser(userData);
  return response.data.user;
};

const updateUser = async (id: string, userData: Partial<AdminUser>) => {
  const response = await dashboardService.updateUser(id, userData);
  return response.data.user;
};

const deleteUser = async (id: string) => {
  await dashboardService.deleteUser(id);
};
```

## Usage Examples

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { contentService, type HeroSection, type AboutSection } from '../services/api_node';

const HomePage: React.FC = () => {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [about, setAbout] = useState<AboutSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const response = await contentService.getPublicContent();
        
        if (response.success) {
          setHero(response.data.hero);
          setAbout(response.data.about);
          setError(null);
        } else {
          setError(response.error || 'Failed to load content');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {hero && (
        <section className="hero">
          <h1>{hero.title}</h1>
          <h2>{hero.subtitle}</h2>
          <p>{hero.description}</p>
          <img src={hero.image} alt={hero.title} />
          <a href={hero.ctaLink}>{hero.ctaText}</a>
        </section>
      )}
      
      {about && (
        <section className="about">
          <h2>{about.title}</h2>
          <p>{about.description}</p>
          <img src={about.image} alt={about.title} />
          <ul>
            {about.achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default HomePage;
```

### Admin Component Example

```typescript
import React, { useState } from 'react';
import { blogService, type BlogPostForm } from '../services/api_node';

const CreateBlogPost: React.FC = () => {
  const [formData, setFormData] = useState<BlogPostForm>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    published: false,
    featured: false,
    tags: [],
    seoTitle: '',
    seoDescription: '',
  });
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await blogService.createBlogPost({
        ...formData,
        image: imageFile,
      });

      if (response.success) {
        console.log('Blog post created successfully');
        // Redirect or show success message
      }
    } catch (error) {
      console.error('Failed to create blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div>
        <label>Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {/* Category options would be loaded from API */}
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          Published
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Blog Post'}
      </button>
    </form>
  );
};

export default CreateBlogPost;
```

## Type Definitions

### Core Types

```typescript
// Response wrapper for all API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// Admin User
interface AdminUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  isLocked: boolean;
  lastLogin?: Date;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Content Types

```typescript
// Hero Section
interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  socialLinks: SocialLink[];
}

// Services
interface Service {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}
```

### Form Types

```typescript
// Blog Post Form
interface BlogPostForm {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  published?: boolean;
  featured?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  image?: File;
}
```

## Error Handling

### Basic Error Handling

```typescript
import { apiClient } from './services/api_node';

const exampleWithErrorHandling = async () => {
  try {
    const response = await contentService.getPublicContent();
    
    if (response.success) {
      // Handle success
      console.log('Data:', response.data);
    } else {
      // Handle API error
      console.error('API Error:', response.error);
    }
  } catch (error) {
    // Handle network or other errors
    if (error instanceof Error) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
  }
};
```

### Advanced Error Handling

```typescript
const advancedErrorHandling = async () => {
  try {
    const response = await authService.login({
      username: 'invalid',
      password: 'wrong'
    });

    if (response.success) {
      // Login successful
    } else {
      // Handle specific error codes
      switch (response.code) {
        case 'INVALID_CREDENTIALS':
          console.error('Invalid username or password');
          break;
        case 'ACCOUNT_LOCKED':
          console.error('Account is locked');
          break;
        case 'ACCOUNT_DEACTIVATED':
          console.error('Account is deactivated');
          break;
        default:
          console.error('Login failed:', response.error);
      }
    }
  } catch (error) {
    // Network or other errors
    if (error.message.includes('fetch')) {
      console.error('Network connection error');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
};
```

## Best Practices

### 1. Use the Service Objects

```typescript
// ✅ Good - Using service objects
import { authService, contentService } from './services/api_node';
const response = await authService.login(credentials);

// ❌ Bad - Using raw apiClient
import { apiClient } from './services/api_node';
const response = await apiClient.login(credentials);
```

### 2. Handle Authentication State

```typescript
import { useEffect, useState } from 'react';
import { apiClient, authService } from './services/api_node';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            setUser(response.data.admin);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Token might be expired
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user, loading };
};
```

### 3. Use Environment Variables

```typescript
// ✅ Good - Using environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ❌ Bad - Hardcoded URL
const API_URL = 'http://localhost:5000/api';
```

### 4. Handle Loading States

```typescript
const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await blogService.getBlogPosts();
        if (response.success) {
          setPosts(response.data);
        } else {
          setError(response.error || 'Failed to load posts');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {posts.map(post => (
        <BlogPostCard key={post._id} post={post} />
      ))}
    </div>
  );
};
```

### 5. Type Your Props and State

```typescript
import { BlogPost } from './services/api_node';

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <div className="blog-post-card">
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <span>{post.publishedAt?.toLocaleDateString()}</span>
    </div>
  );
};
```

## Conclusion

This API client provides a comprehensive, type-safe interface to The ACJ Portfolio backend. Use the service objects for cleaner code, handle errors appropriately, and take advantage of TypeScript's type safety for better development experience.

For more information about specific endpoints, refer to the backend API documentation or examine the source code in `api_node.ts`.