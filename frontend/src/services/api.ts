import axios from 'axios';
export const API_URL = import.meta.env.VITE_API_URL || 'https://theacj.alwaysdata.net/api/';

const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = '';
    if (document.cookie) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith(`${name}=`)) {
          cookieValue = decodeURIComponent(trimmedCookie.slice(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  
axios.defaults.headers.common['X-CSRFToken'] = getCsrfToken();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  getAllWorks: () => api.get<WorkItem[]>('/works'),
  getWorkItem: (id: string) => api.get<WorkItem>(`/works/${id}/`),
  createWorkItem: (data: FormData) => api.post('/works/', data),
  updateWorkItem: (id: string, data: FormData) => api.put(`/works/${id}/`, data),
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
  sendMessage: (message: ContactForm) => api.post('/contact', message),
};