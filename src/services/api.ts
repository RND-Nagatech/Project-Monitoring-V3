import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API: Request interceptor - token exists:', !!token);
    console.log('API: Request URL:', config.url);
    console.log('API: Request method:', config.method);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API: Authorization header set');
    } else {
      console.warn('API: No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Jangan redirect, biarkan error di-handle React
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { user_id: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { user_id: string; name: string; password: string; role: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Inquiry API
export const inquiryAPI = {
  getAll: async (params = {}) => {
    // params: { page, limit, search, status }
    const response = await api.get('/inquiries', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
  },

  create: async (inquiryData: FormData) => {
    const response = await api.post('/inquiries', inquiryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, updateData: any) => {
    console.log('API: inquiryAPI.update called with ID:', id, 'data:', updateData);
    console.log('API: ID type:', typeof id, 'ID length:', id?.length);
    console.log('API: API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length !== 24) {
      console.error('API: Invalid ID format:', id);
      throw new Error('Invalid inquiry ID format');
    }

    try {
      const fullUrl = `${import.meta.env.VITE_API_BASE_URL}/inquiries/${id}`;
      console.log('API: Full request URL:', fullUrl);

      const isFormData = updateData instanceof FormData;
      const response = await api.put(`/inquiries/${id}`, updateData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      console.log('API: inquiryAPI.update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: inquiryAPI.update failed:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      console.error('API: Error message:', error.message);
      throw error;
    }
  },

  delete: async (id: string) => {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, statusData: { status: string; followUpMessage?: string }) => {
    const response = await api.patch(`/inquiries/${id}/status`, statusData);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;