// src/services/apiService.ts
import axios, { AxiosInstance } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://theacj.alwaysdata.net/api/';

class ApiService {
  private api: AxiosInstance;
  private csrfToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(async (config) => {
      // Only add CSRF token for non-GET requests
      if (config.method !== 'get') {
        // If we don't have a CSRF token, get one
        if (!this.csrfToken) {
          await this.fetchCsrfToken();
        }
        config.headers['X-CSRFToken'] = this.csrfToken;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403 && error.response?.data?.includes('CSRF')) {
          // CSRF token might be expired, get a new one and retry
          await this.fetchCsrfToken();
          // Retry the original request
          const config = error.config;
          config.headers['X-CSRFToken'] = this.csrfToken;
          return this.api(config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async fetchCsrfToken(): Promise<void> {
    try {
      // Make a request to your CSRF endpoint
      await this.api.get('/get-csrf-token/');
      // Get the token from cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
          this.csrfToken = value;
          break;
        }
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  // Helper method for FormData requests
  private getFormDataHeaders() {
    return {
      'Content-Type': 'multipart/form-data',
      'X-CSRFToken': this.csrfToken || '',
    };
  }

  // Your service methods
  public async getAllWorks() {
    const response = await this.api.get<WorkItem[]>('/works');
    return response.data;
  }

  public async getWorkItem(id: string) {
    const response = await this.api.get<WorkItem>(`/works/${id}/`);
    return response.data;
  }

  public async createWorkItem(data: FormData) {
    const response = await this.api.post('/works/', data, {
      headers: this.getFormDataHeaders(),
    });
    return response.data;
  }

  public async updateWorkItem(id: string, data: FormData) {
    const response = await this.api.put(`/works/${id}/`, data, {
      headers: this.getFormDataHeaders(),
    });
    return response.data;
  }

}

// Create and export a single instance
export const apiService = new ApiService();

export interface WorkItem {
  id: number;
  title: string;
  category: string | null;
  description: string;
  image: string | null;
  link: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  date_published: string;
  image_url?: string;
  image?: string;
  link?: string;
  category?: {
    name: string;
    friendly_name?: string;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Category {
  id: number;
  name: string;
  friendly_name?: string;
}



export const workService = {
    getAllWorks: () => apiService.getAllWorks(),
    getWorkItem: (id: string) => apiService.getWorkItem(id),
    createWorkItem: (data: FormData) => apiService.createWorkItem(data),
    updateWorkItem: (id: string, data: FormData) => apiService.updateWorkItem(id),
  };


export const blogService = {
  getRecentPosts: () => api.get<BlogPost[]>('/blog-posts'),
  getBlogPost: (id: string) => api.get<BlogPost>(`/blog/${id}/`),
  createPost: (data: FormData) => api.post('/blogsadd/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updatePost: (id: string, data: FormData) => api.put(`/posts/${id}/`, data),
  getCategories: () => api.get<Category[]>('/categories/'),
};


export const contactService = {
  sendMessage: async (message: ContactForm) => {
    try {
      const response = await api.post('contact/', message);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};