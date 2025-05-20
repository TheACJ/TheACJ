import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://theacj.alwaysdata.net/api';

// Ensure cookies are sent with every request.
axios.defaults.withCredentials = true;



// Utility function to get a cookie by name
function getCookie(name: string): string | null {
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

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent
});

// Add CSRF token interceptor
api.interceptors.request.use(
  async (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      let csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        await api.get('/csrf/'); // Fetch CSRF cookie if missing
        csrfToken = getCookie('csrftoken');
      }
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      } else {
        console.error('CSRF token could not be retrieved');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


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
      headers: { 
        'Content-Type': 'multipart/form-data'

       },     
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
    const response = await api.post('contact/', message);
    return response.data;
  },
};
