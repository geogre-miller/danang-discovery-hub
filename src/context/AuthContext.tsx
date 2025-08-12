import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ddh_token');
      const savedUser = localStorage.getItem('ddh_user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('ddh_user', JSON.stringify(currentUser));
        } catch (error) {
          // Token is invalid, clear auth state
          console.error('Token validation failed:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      const { accessToken, refreshToken, user } = response;
      
      // Store tokens and user data
      localStorage.setItem('ddh_token', accessToken);
      localStorage.setItem('ddh_refresh_token', refreshToken);
      localStorage.setItem('ddh_user', JSON.stringify(user));
      
      setToken(accessToken);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      const { accessToken, refreshToken, user } = response;
      
      // Store tokens and user data
      localStorage.setItem('ddh_token', accessToken);
      localStorage.setItem('ddh_refresh_token', refreshToken);
      localStorage.setItem('ddh_user', JSON.stringify(user));
      
      setToken(accessToken);
      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      if (token) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('ddh_user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
