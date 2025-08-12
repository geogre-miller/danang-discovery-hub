import { useAuth } from '@/context/AuthContext';

export default function DebugAuth() {
  const { user, token, loading } = useAuth();
  
  return (
    <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg z-50">
      <h3 className="font-bold mb-2">Debug Auth Info:</h3>
      <div className="text-sm">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>Has Token: {token ? 'true' : 'false'}</p>
        <p>User: {user ? 'exists' : 'null'}</p>
        {user && (
          <>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>Is Admin: {user.role === 'admin' ? 'true' : 'false'}</p>
          </>
        )}
      </div>
    </div>
  );
}
