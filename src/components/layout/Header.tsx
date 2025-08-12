import { Link, NavLink } from 'react-router-dom';
import { Menu, Heart, Home, LogIn, UserPlus, Star, PlusSquare } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `${isActive ? 'text-primary font-semibold' : 'text-foreground/70'} hover:text-foreground transition-colors`;

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Star className="text-primary" />
          <span className="font-display text-xl">Da Nang Discovery</span>
        </Link>
        <button className="md:hidden p-2 rounded-md border hover:bg-secondary" onClick={() => setOpen((o) => !o)} aria-label="Toggle Menu">
          <Menu />
        </button>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={linkCls}><Home className="inline mr-1" size={18}/>Home</NavLink>
          <NavLink to="/favorites" className={linkCls}><Heart className="inline mr-1" size={18}/>Favorites</NavLink>
          {!user ? (
            <div className="flex items-center gap-4">
              <NavLink to="/login" className={linkCls}><LogIn className="inline mr-1" size={18}/>Login</NavLink>
              <NavLink to="/register" className={linkCls}><UserPlus className="inline mr-1" size={18}/>Register</NavLink>
            </div>
          ) : (
            <UserProfileDropdown />
          )}
        </nav>
      </div>
      {open && (
        <div className="md:hidden border-t animate-fade-in">
          <div className="px-4 py-3 space-y-3">
            <NavLink to="/" end className={linkCls} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/favorites" className={linkCls} onClick={() => setOpen(false)}>Favorites</NavLink>
            {!user ? (
              <div className="space-y-3">
                <NavLink to="/login" className={linkCls} onClick={() => setOpen(false)}>Login</NavLink>
                <NavLink to="/register" className={linkCls} onClick={() => setOpen(false)}>Register</NavLink>
              </div>
            ) : (
              <div className="space-y-3">
                <NavLink to="/profile" className={linkCls} onClick={() => setOpen(false)}>Profile</NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={linkCls} onClick={() => setOpen(false)}>Admin Dashboard</NavLink>
                )}
                <button 
                  className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground text-left" 
                  onClick={() => { logout(); setOpen(false); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
