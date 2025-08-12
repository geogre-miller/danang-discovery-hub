import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const schema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

type FormVals = z.infer<typeof schema>;

export default function Register() {
  const { register: doRegister } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormVals>({ resolver: zodResolver(schema) });

  const onSubmit = async (vals: FormVals) => {
    try {
      await doRegister(vals.username, vals.email, vals.password);
      nav('/');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Helmet>
        <title>Register — Da Nang Discovery Hub</title>
        <meta name="description" content="Create an account to save favorites and leave reviews." />
      </Helmet>
      <h1 className="font-display text-3xl mb-6">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input className="w-full rounded-md border px-3 py-2" placeholder="Your name" {...register('username')} />
          {errors.username && <p className="text-destructive text-sm mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full rounded-md border px-3 py-2" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full rounded-md border px-3 py-2" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90">
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-sm text-muted-foreground">Have an account? <Link to="/login" className="story-link">Login</Link></p>
      </form>
    </div>
  );
}
