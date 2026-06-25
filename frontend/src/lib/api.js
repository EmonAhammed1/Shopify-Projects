import axios from 'axios';

// In production (Vercel), API routes live on the same domain at /api
// No external backend URL needed!
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT token to protected requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('portfolio_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Projects ───────────────────────────────────────────────
export const getProjects = (params = {}) => api.get('/projects', { params });
export const getProject = (slug) => api.get(`/projects/${slug}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ─── Contact ─────────────────────────────────────────────────
export const submitContact = (data) => api.post('/contact', data);
export const getMessages = () => api.get('/contact');
export const toggleMessageRead = (id) => api.patch(`/contact/${id}`);
export const deleteMessage = (id) => api.delete(`/contact/${id}`);

// ─── Auth ────────────────────────────────────────────────────
export const loginAdmin = (data) => api.post('/auth/login', data);
export const getAdminMe = () => api.get('/auth/me');

export default api;
