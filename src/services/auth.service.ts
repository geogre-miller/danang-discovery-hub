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
  },

  // Update profile
  async updateProfile(profileData: { name?: string; avatar?: string }): Promise<User> {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data.user;
  },

  // Add to favorites
  async addToFavorites(placeId: string): Promise<any> {
    const response = await api.post(`/api/auth/favorites/${placeId}`);
    return response.data;
  },

  // Remove from favorites
  async removeFromFavorites(placeId: string): Promise<any> {
    const response = await api.delete(`/api/auth/favorites/${placeId}`);
    return response.data;
  },

  // Get favorites
  async getFavorites(): Promise<any> {
    const response = await api.get('/api/auth/favorites');
    return response.data;
  }
};
