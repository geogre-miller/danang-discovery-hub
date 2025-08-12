import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  showNotFoundForUnauthorized = false 
}: { 
  children: JSX.Element; 
  adminOnly?: boolean;
  showNotFoundForUnauthorized?: boolean;
}) {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  // If user is not logged in
  if (!token || !user) {
    if (showNotFoundForUnauthorized) {
      return <Navigate to="/404" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  // If admin access is required but user is not admin
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/404" replace />;
  }
  
  return children;
}
