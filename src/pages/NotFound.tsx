import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <div className="text-7xl mb-4">🦥</div>
        <h1 className="text-4xl font-display mb-2">404 — Lost in Da Nang</h1>
        <p className="text-lg text-muted-foreground mb-6">We couldn't find that page. Let's head back to the beach.</p>
        <a href="/" className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90">Return Home</a>
      </div>
    </div>
  );
};

export default NotFound;
