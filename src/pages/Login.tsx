import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long')
});

type FormVals = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormVals>({ 
    resolver: zodResolver(schema),
    mode: 'onBlur' // Validate on blur for better UX
  });

  const onSubmit = async (vals: FormVals) => {
    try {
      await login({ email: vals.email, password: vals.password });
      toast({
        
        title: "Welcome back! 🎉",
        description: "Enjoy exploring the best places in Da Nang!",
      });
      nav('/');
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || 'Login failed';
      
      toast({
        variant: "destructive",
        title: "Login Failed ",
        description: errorMessage === 'Invalid credentials' 
          ? "Invalid email or password. Please check your credentials and try again."
          : errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Helmet>
        <title>Login — Da Nang Discovery Hub</title>
        <meta name="description" content="Login to save favorites and write reviews." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.email 
                  ? 'border-destructive bg-destructive/5' 
                  : 'border-input bg-background hover:border-primary/50'
              }`}
              placeholder="Enter your email address"
              {...reg('email')}
            />
            {errors.email && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
            )}
          </div>
          {errors.email && (
            <p className="text-destructive text-xs flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.password 
                  ? 'border-destructive bg-destructive/5' 
                  : 'border-input bg-background hover:border-primary/50'
              }`}
              placeholder="Enter your password"
              {...reg('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="story-link text-primary font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
