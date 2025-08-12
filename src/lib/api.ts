import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ddh_token');
  if (token) {
    // Use AxiosHeaders.set when available to satisfy TS types
    const headers: any = config.headers;
    if (headers && typeof headers.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any) = { ...(config.headers as any), Authorization: `Bearer ${token}` };
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // You can expand this to handle global errors or 401 redirects
    return Promise.reject(error);
  }
);

export default api;
