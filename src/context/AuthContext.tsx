import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('ddh_token');
    const u = localStorage.getItem('ddh_user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, user } = data;
    localStorage.setItem('ddh_token', token);
    localStorage.setItem('ddh_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    const { token, user } = data;
    localStorage.setItem('ddh_token', token);
    localStorage.setItem('ddh_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('ddh_token');
    localStorage.removeItem('ddh_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
