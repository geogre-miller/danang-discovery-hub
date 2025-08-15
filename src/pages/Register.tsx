import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your full name')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Please enter a password')
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)|(?=.*[@$!%*?&])/, 'Password should contain at least one uppercase letter, lowercase letter, number, or special character')
});

type FormVals = z.infer<typeof schema>;

export default function Register() {
  const { register: doRegister } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormVals>({ 
    resolver: zodResolver(schema),
    mode: 'onBlur' // Validate on blur for better UX
  });

  const onSubmit = async (vals: FormVals) => {
    try {
      await doRegister({ name: vals.name, email: vals.email, password: vals.password });
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Da Nang Discovery Hub. You can now explore and save your favorite places.",
      });
      nav('/');
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || 'Registration failed';
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage === 'User already exists' 
          ? "An account with this email already exists. Please try logging in instead."
          : errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Helmet>
        <title>Register — Da Nang Discovery Hub</title>
        <meta name="description" content="Create an account to save favorites and leave reviews." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">Join Da Nang Discovery Hub to explore the best places</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              className={`w-full rounded-lg border px-4 py-3 pl-11 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name 
                  ? 'border-destructive bg-destructive/5' 
                  : 'border-input bg-background hover:border-primary/50'
              }`}
              placeholder="Enter your full name"
              {...register('name')}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {errors.name && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
            )}
          </div>
          {errors.name && (
            <p className="text-destructive text-xs flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name.message}
            </p>
          )}
        </div>

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
              {...register('email')}
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
              placeholder="Create a secure password"
              {...register('password')}
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
          <p className="text-xs text-muted-foreground">
            Password should be at least 6 characters with a mix of letters, numbers, or symbols
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="story-link text-primary font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
