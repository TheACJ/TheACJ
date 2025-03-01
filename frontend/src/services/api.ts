import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://theacj.alwaysdata.net/api';

// Ensure cookies are sent with every request.
axios.defaults.withCredentials = true;

// Utility function to retrieve a cookie by name.
function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add an interceptor to check for a CSRF token before any modifying request.
axios.interceptors.request.use(
  async (config) => {
    // Only apply for methods that modify data.
    if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
      // Check for CSRF token in cookies.
      let csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        // If token is missing, call the endpoint to set the CSRF cookie.
        await axios.get(`${API_URL}/get-csrf-token/`);
        csrfToken = getCookie('csrftoken');
      }
      // Attach the CSRF token to the request headers.
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create an Axios instance with your API base URL.
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define your TypeScript interfaces.
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

// Define your services. Notice that we do not need to set the CSRF header manually here.
export const workService = {
  getAllWorks: () => api.get<WorkItem[]>('/works'),
  getWorkItem: (id: string) => api.get<WorkItem>(`/works/${id}/`),
  createWorkItem: (data: FormData) =>
    api.post('/works/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },     
    }),
    updateWorkItem: (id: string, data: FormData) =>
      api.put(`/works/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
};

export const blogService = {
  getRecentPosts: () => api.get<BlogPost[]>('/blog-posts'),
  getBlogPost: (id: string) => api.get<BlogPost>(`/blog/${id}/`),
  createPost: (data: FormData) =>
    api.post('/blogsadd/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
