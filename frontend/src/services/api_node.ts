/**
 * Comprehensive API client for The ACJ Portfolio Backend
 * Based on Node.js backend routes and controllers
 * 
 * @version 1.0.0
 * @author The ACJ Portfolio
 */

// ========================================
// CONFIGURATION & TYPES
// ========================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Response wrapper for all API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ========================================
// CORE INTERFACES
// ========================================

// Admin User Interfaces
export interface AdminUser {
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

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  admin: AdminUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ========================================
// CONTENT INTERFACES
// ========================================

// Hero Section
export interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  buttonText: string;
  buttonIcon: string;
  buttonLink: string;
}

export interface HeroSection {
  slides: HeroSlide[];
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// About Section
export interface AboutSection {
  title: string;
  description: string;
  image: string;
  achievements: string[];
}

// Service
export interface Service {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

// Counter
export interface CounterItem {
  _id?: string;
  title: string;
  value: string;
  icon: string;
}

// Skill
export interface Skill {
  _id?: string;
  name: string;
  level: number; // 0-100
  icon: string;
}

// Content sections response
export interface ContentSections {
  hero: HeroSection;
  about: AboutSection;
  services: Service[];
  counter: CounterItem[];
  skills: Skill[];
}

// ========================================
// CONTENT ITEM INTERFACES
// ========================================

// Blog Post
export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  image: string;
  imageUrl?: string;
  category: Category;
  author: string;
  slug: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Work Item
export interface WorkItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: Category;
  client?: string;
  url?: string;
  github?: string;
  technologies: string[];
  status: 'planning' | 'in-progress' | 'completed';
  completionDate?: Date;
  featured: boolean;
  gallery?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Category
export interface Category {
  _id: string;
  name: string;
  friendlyName: string;
  slug: string;
  type: 'blog' | 'work';
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contact
export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  source?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  repliedAt?: Date;
}

// ========================================
// FORM DATA INTERFACES
// ========================================

// Blog Post Form Data
export interface BlogPostForm {
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

// Work Item Form Data
export interface WorkItemForm {
  title: string;
  description: string;
  category: string;
  client?: string;
  url?: string;
  github?: string;
  technologies: string[];
  status: 'planning' | 'in-progress' | 'completed';
  completionDate?: string;
  featured?: boolean;
  image?: File;
  gallery?: File[];
}

// Category Form Data
export interface CategoryForm {
  name: string;
  friendlyName: string;
  description?: string;
  color?: string;
}

// Content Form Data
export interface ContentForm {
  hero: Partial<HeroSection>;
  about: Partial<AboutSection>;
  services: Service[];
  counter: CounterItem[];
  skills: Skill[];
}

// ========================================
// API CLIENT CLASS
// ========================================

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    this.authToken = localStorage.getItem('adminToken');
  }

  private saveTokenToStorage(token: string): void {
    this.authToken = token;
    localStorage.setItem('adminToken', token);
  }

  private removeTokenFromStorage(): void {
    this.authToken = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
  }

  private getHeaders(isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  /**
   * Admin login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${this.baseURL}/admin/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<ApiResponse<LoginResponse>>(response);
    
    if (result.success && result.data?.token) {
      this.saveTokenToStorage(result.data.token);
    }

    return result;
  }

  /**
   * Admin logout
   */
  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    this.removeTokenFromStorage();
    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Get current admin profile
   */
  async getProfile(): Promise<ApiResponse<{ admin: AdminUser }>> {
    const response = await fetch(`${this.baseURL}/admin/auth/me`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ admin: AdminUser }>>(response);
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/auth/verify`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Update admin profile
   */
  async updateProfile(data: { email: string; fullName: string }): Promise<ApiResponse<{ admin: AdminUser }>> {
    const response = await fetch(`${this.baseURL}/admin/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<ApiResponse<{ admin: AdminUser }>>(response);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/auth/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    const response = await fetch(`${this.baseURL}/admin/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    const result = await this.handleResponse<ApiResponse<{ token: string; refreshToken?: string }>>(response);
    
    if (result.success && result.data?.token) {
      this.saveTokenToStorage(result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('adminRefreshToken', result.data.refreshToken);
      }
    }

    return result;
  }

  // ========================================
  // CONTENT MANAGEMENT METHODS
  // ========================================

  /**
   * Get public content sections (fallback to defaults)
   */
  async getPublicContent(): Promise<ApiResponse<ContentSections>> {
    const response = await fetch(`${this.baseURL}/content/public`);
    return this.handleResponse<ApiResponse<ContentSections>>(response);
  }

  /**
   * Get all content sections (admin)
   */
  async getContentSections(): Promise<ApiResponse<{ content: ContentSections }>> {
    const response = await fetch(`${this.baseURL}/admin/content/sections`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ content: ContentSections }>>(response);
  }

  /**
   * Get specific content section (admin)
   */
  async getContentSection(sectionType: string): Promise<ApiResponse<{ content: ContentSections }>> {
    const response = await fetch(`${this.baseURL}/admin/content/sections/${sectionType}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ content: ContentSections }>>(response);
  }

  /**
   * Update content section (admin)
   */
  async updateContentSection(sectionType: string, data: any): Promise<ApiResponse<{ content: ContentSections }>> {
    const response = await fetch(`${this.baseURL}/admin/content/sections/${sectionType}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<ApiResponse<{ content: ContentSections }>>(response);
  }

  /**
   * Reset section to default (admin)
   */
  async resetContentSection(sectionType: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/content/sections/reset/${sectionType}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  // ========================================
  // BLOG POSTS METHODS
  // ========================================

  /**
   * Get all blog posts (public)
   */
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    const response = await fetch(`${this.baseURL}/blog-posts`);
    return this.handleResponse<ApiResponse<BlogPost[]>>(response);
  }

  /**
   * Get single blog post (public)
   */
  async getBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
    const response = await fetch(`${this.baseURL}/blog-posts/${id}`);
    return this.handleResponse<ApiResponse<BlogPost>>(response);
  }

  /**
   * Get blog posts (admin)
   */
  async getAdminBlogPosts(): Promise<ApiResponse<{ blogPosts: BlogPost[] }>> {
    const response = await fetch(`${this.baseURL}/admin/content/blog-posts`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ blogPosts: BlogPost[] }>>(response);
  }

  /**
   * Create blog post (admin)
   */
  async createBlogPost(formData: BlogPostForm & { image?: File }): Promise<ApiResponse<{ blogPost: BlogPost }>> {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          data.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => data.append(`${key}[]`, item));
        } else {
          data.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${this.baseURL}/admin/content/blog-posts`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: data,
    });

    return this.handleResponse<ApiResponse<{ blogPost: BlogPost }>>(response);
  }

  /**
   * Update blog post (admin)
   */
  async updateBlogPost(id: string, formData: BlogPostForm & { image?: File }): Promise<ApiResponse<{ blogPost: BlogPost }>> {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          data.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => data.append(`${key}[]`, item));
        } else {
          data.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${this.baseURL}/admin/content/blog-posts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: data,
    });

    return this.handleResponse<ApiResponse<{ blogPost: BlogPost }>>(response);
  }

  /**
   * Delete blog post (admin)
   */
  async deleteBlogPost(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/content/blog-posts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  // ========================================
  // WORK ITEMS METHODS
  // ========================================

  /**
   * Get all work items (public)
   */
  async getWorkItems(): Promise<ApiResponse<WorkItem[]>> {
    const response = await fetch(`${this.baseURL}/works`);
    return this.handleResponse<ApiResponse<WorkItem[]>>(response);
  }

  /**
   * Get single work item (public)
   */
  async getWorkItem(id: string): Promise<ApiResponse<WorkItem>> {
    const response = await fetch(`${this.baseURL}/works/${id}`);
    return this.handleResponse<ApiResponse<WorkItem>>(response);
  }

  /**
   * Get work items (admin)
   */
  async getAdminWorkItems(): Promise<ApiResponse<{ workItems: WorkItem[] }>> {
    const response = await fetch(`${this.baseURL}/admin/content/work-items`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ workItems: WorkItem[] }>>(response);
  }

  /**
   * Create work item (admin)
   */
  async createWorkItem(formData: WorkItemForm): Promise<ApiResponse<{ workItem: WorkItem }>> {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item instanceof File) {
              data.append(`gallery[]`, item);
            } else {
              data.append(`${key}[]`, item.toString());
            }
          });
        } else if (value instanceof File) {
          data.append(key, value);
        } else {
          data.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${this.baseURL}/admin/content/work-items`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: data,
    });

    return this.handleResponse<ApiResponse<{ workItem: WorkItem }>>(response);
  }

  /**
   * Update work item (admin)
   */
  async updateWorkItem(id: string, formData: WorkItemForm): Promise<ApiResponse<{ workItem: WorkItem }>> {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item instanceof File) {
              data.append(`gallery[]`, item);
            } else {
              data.append(`${key}[]`, item.toString());
            }
          });
        } else if (value instanceof File) {
          data.append(key, value);
        } else {
          data.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${this.baseURL}/admin/content/work-items/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: data,
    });

    return this.handleResponse<ApiResponse<{ workItem: WorkItem }>>(response);
  }

  /**
   * Delete work item (admin)
   */
  async deleteWorkItem(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/content/work-items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  // ========================================
  // CATEGORIES METHODS
  // ========================================

  /**
   * Get categories (public)
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await fetch(`${this.baseURL}/categories`);
    return this.handleResponse<ApiResponse<Category[]>>(response);
  }

  /**
   * Get single category (public)
   */
  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await fetch(`${this.baseURL}/categories/${id}`);
    return this.handleResponse<ApiResponse<Category>>(response);
  }

  /**
   * Get categories (admin)
   */
  async getAdminCategories(type?: 'blog' | 'work'): Promise<ApiResponse<{ categories: Category[] }>> {
    const url = type ? `${this.baseURL}/admin/content/categories?type=${type}` : `${this.baseURL}/admin/content/categories`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ categories: Category[] }>>(response);
  }

  /**
   * Create category (admin)
   */
  async createCategory(formData: CategoryForm): Promise<ApiResponse<{ category: Category }>> {
    const response = await fetch(`${this.baseURL}/admin/content/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(formData),
    });

    return this.handleResponse<ApiResponse<{ category: Category }>>(response);
  }

  /**
   * Update category (admin)
   */
  async updateCategory(id: string, formData: CategoryForm): Promise<ApiResponse<{ category: Category }>> {
    const response = await fetch(`${this.baseURL}/admin/content/categories/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(formData),
    });

    return this.handleResponse<ApiResponse<{ category: Category }>>(response);
  }

  /**
   * Delete category (admin)
   */
  async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/content/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  // ========================================
  // CONTACTS METHODS
  // ========================================

  /**
   * Submit contact form (public)
   */
  async submitContact(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/contacts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Get contacts (admin)
   */
  async getContacts(): Promise<ApiResponse<{ contacts: Contact[] }>> {
    const response = await fetch(`${this.baseURL}/admin/content/contacts`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ contacts: Contact[] }>>(response);
  }

  /**
   * Get single contact (admin)
   */
  async getContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    const response = await fetch(`${this.baseURL}/admin/content/contacts/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ contact: Contact }>>(response);
  }

  /**
   * Delete contact (admin)
   */
  async deleteContact(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/content/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  // ========================================
  // UPLOAD METHODS
  // ========================================

  /**
   * Upload image (admin)
   */
  async uploadImage(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const data = new FormData();
    data.append('image', file);

    const response = await fetch(`${this.baseURL}/admin/upload/image`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: data,
    });

    return this.handleResponse<ApiResponse<{ url: string; filename: string }>>(response);
  }

  // ========================================
  // DASHBOARD METHODS
  // ========================================

  /**
   * Get dashboard statistics (admin)
   */
  async getDashboardStats(): Promise<ApiResponse<{
    totalUsers: number;
    totalBlogPosts: number;
    totalWorkItems: number;
    unreadContacts: number;
    recentActivity: any[];
    monthlyData: {
      posts: number;
      contacts: number;
      users: number;
    };
  }>> {
    const response = await fetch(`${this.baseURL}/admin/dashboard/stats`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  /**
   * Get users (super admin only)
   */
  async getUsers(): Promise<ApiResponse<{ users: AdminUser[] }>> {
    const response = await fetch(`${this.baseURL}/admin/dashboard/users`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse<{ users: AdminUser[] }>>(response);
  }

  /**
   * Create user (super admin only)
   */
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: 'admin' | 'super_admin';
  }): Promise<ApiResponse<{ user: AdminUser }>> {
    const response = await fetch(`${this.baseURL}/admin/dashboard/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<ApiResponse<{ user: AdminUser }>>(response);
  }

  /**
   * Update user (super admin only)
   */
  async updateUser(id: string, userData: Partial<AdminUser>): Promise<ApiResponse<{ user: AdminUser }>> {
    const response = await fetch(`${this.baseURL}/admin/dashboard/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<ApiResponse<{ user: AdminUser }>>(response);
  }

  /**
   * Delete user (super admin only)
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseURL}/admin/dashboard/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ApiResponse>(response);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.authToken;
  }

  /**
   * Set auth token manually
   */
  setToken(token: string): void {
    this.saveTokenToStorage(token);
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.removeTokenFromStorage();
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const apiClient = new ApiClient(API_URL);

// ========================================
// EXPORT CONVENIENT SERVICE METHODS
// ========================================

// Authentication
export const authService = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getProfile: () => apiClient.getProfile(),
  verifyToken: () => apiClient.verifyToken(),
  updateProfile: (data: { email: string; fullName: string }) => apiClient.updateProfile(data),
  changePassword: (data: ChangePasswordRequest) => apiClient.changePassword(data),
  forgotPassword: (data: ForgotPasswordRequest) => apiClient.forgotPassword(data),
  resetPassword: (data: ResetPasswordRequest) => apiClient.resetPassword(data),
  refreshToken: (refreshToken: string) => apiClient.refreshToken(refreshToken),
};

// Content Management
export const contentService = {
  getPublicContent: () => apiClient.getPublicContent(),
  getContentSections: () => apiClient.getContentSections(),
  getContentSection: (sectionType: string) => apiClient.getContentSection(sectionType),
  updateContentSection: (sectionType: string, data: any) => apiClient.updateContentSection(sectionType, data),
  resetContentSection: (sectionType: string) => apiClient.resetContentSection(sectionType),
};

// Blog Posts
export const blogService = {
  getBlogPosts: () => apiClient.getBlogPosts(),
  getBlogPost: (id: string) => apiClient.getBlogPost(id),
  getAdminBlogPosts: () => apiClient.getAdminBlogPosts(),
  createBlogPost: (formData: BlogPostForm & { image?: File }) => apiClient.createBlogPost(formData),
  updateBlogPost: (id: string, formData: BlogPostForm & { image?: File }) => apiClient.updateBlogPost(id, formData),
  deleteBlogPost: (id: string) => apiClient.deleteBlogPost(id),
};

// Work Items
export const workService = {
  getWorkItems: () => apiClient.getWorkItems(),
  getWorkItem: (id: string) => apiClient.getWorkItem(id),
  getAdminWorkItems: () => apiClient.getAdminWorkItems(),
  createWorkItem: (formData: WorkItemForm) => apiClient.createWorkItem(formData),
  updateWorkItem: (id: string, formData: WorkItemForm) => apiClient.updateWorkItem(id, formData),
  deleteWorkItem: (id: string) => apiClient.deleteWorkItem(id),
};

// Categories
export const categoryService = {
  getCategories: () => apiClient.getCategories(),
  getCategory: (id: string) => apiClient.getCategory(id),
  getAdminCategories: (type?: 'blog' | 'work') => apiClient.getAdminCategories(type),
  createCategory: (formData: CategoryForm) => apiClient.createCategory(formData),
  updateCategory: (id: string, formData: CategoryForm) => apiClient.updateCategory(id, formData),
  deleteCategory: (id: string) => apiClient.deleteCategory(id),
};

// Contacts
export const contactService = {
  submitContact: (data: { name: string; email: string; subject: string; message: string }) => 
    apiClient.submitContact(data),
  getContacts: () => apiClient.getContacts(),
  getContact: (id: string) => apiClient.getContact(id),
  deleteContact: (id: string) => apiClient.deleteContact(id),
};

// Upload
export const uploadService = {
  uploadImage: (file: File) => apiClient.uploadImage(file),
};

// Dashboard
export const dashboardService = {
  getStats: () => apiClient.getDashboardStats(),
  getUsers: () => apiClient.getUsers(),
  createUser: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: 'admin' | 'super_admin';
  }) => apiClient.createUser(userData),
  updateUser: (id: string, userData: Partial<AdminUser>) => apiClient.updateUser(id, userData),
  deleteUser: (id: string) => apiClient.deleteUser(id),
};

// ========================================
// EXPORT DEFAULT INSTANCE
// ========================================

export default apiClient;