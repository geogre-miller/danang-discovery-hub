import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormVals = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormVals>({ resolver: zodResolver(schema) });

  const onSubmit = async (vals: FormVals) => {
    try {
      await login(vals.email, vals.password);
      nav('/');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Helmet>
        <title>Login — Da Nang Discovery Hub</title>
        <meta name="description" content="Login to save favorites and write reviews." />
      </Helmet>
      <h1 className="font-display text-3xl mb-6">Welcome back</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full rounded-md border px-3 py-2" placeholder="you@example.com" {...reg('email')} />
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full rounded-md border px-3 py-2" placeholder="••••••••" {...reg('password')} />
          {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90">
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>
        <p className="text-sm text-muted-foreground">No account? <Link to="/register" className="story-link">Register</Link></p>
      </form>
    </div>
  );
}
