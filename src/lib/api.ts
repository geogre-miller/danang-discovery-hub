import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ddh_token');
  if (token) {
    config.headers.Authorization = token; // Backend expects "Bearer " + token format
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('ddh_refresh_token');
      if (refreshToken) {
        try {
          const response = await api.post('/api/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          localStorage.setItem('ddh_token', accessToken);
          originalRequest.headers.Authorization = accessToken;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('ddh_token');
          localStorage.removeItem('ddh_refresh_token');
          localStorage.removeItem('ddh_user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
