import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import PlaceManagement from '@/components/admin/PlaceManagement';

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Admin Dashboard — Da Nang Discovery Hub</title>
        <meta name="description" content="Manage places in the catalog." />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Manage your places and users from here.
        </p>
      </div>

      <PlaceManagement />
    </div>
  );
}
