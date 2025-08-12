import api from '@/lib/api';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  User 
} from '@/types/auth';

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Refresh token
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post('/api/auth/refresh', data);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/current');
    return response.data;
  },

  // Google OAuth
  getGoogleAuthUrl(): string {
    return `${api.defaults.baseURL}/api/auth/google`;
  },

  // Facebook OAuth
  getFacebookAuthUrl(): string {
    return `${api.defaults.baseURL}/api/auth/facebook`;
  },

  // Logout (client-side)
  logout(): void {
    localStorage.removeItem('ddh_token');
    localStorage.removeItem('ddh_refresh_token');
    localStorage.removeItem('ddh_user');
  }
};
