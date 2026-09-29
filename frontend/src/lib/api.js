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
export const reorderProjects = (orders) => api.post('/projects/reorder', { orders });

// ─── Contact ─────────────────────────────────────────────────
export const submitContact = (data) => api.post('/contact', data);
export const getMessages = () => api.get('/contact');
export const toggleMessageRead = (id) => api.patch(`/contact/${id}`);
export const deleteMessage = (id) => api.delete(`/contact/${id}`);

// ─── Upload (ImgBB) ─────────────────────────────────────────
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  // Try direct ImgBB upload first
  try {
    const res = await fetch('https://api.imgbb.com/1/upload?key=81995afd703f5d59b1fca06f9266fd65', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.data?.url) {
      return data.data.url;
    }
  } catch (err) {
    console.warn('Direct ImgBB upload failed, falling back to /api/upload', err);
  }

  // Fallback to internal /api/upload
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};

// ─── Auth ────────────────────────────────────────────────────
export const loginAdmin = (data) => api.post('/auth/login', data);
export const getAdminMe = () => api.get('/auth/me');

export default api;
