import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/authHooks';
import { loginSchema } from '@/schemas';
import { AuthFormLayout, AuthFooterLink } from './AuthFormLayout';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export function LoginForm() {
  const { login, guestLogin, loading } = useAuth();
  const [isLoggingInGuest, setIsLoggingInGuest] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (!result.success) {
      toast.error(result.error?.message || 'Login failed');
    }
  };

  const handleGuestLogin = async () => {
    setIsLoggingInGuest(true);
    try {
      await guestLogin();
    } catch (err) {
      toast.error('Failed to log in as guest');
    } finally {
      setIsLoggingInGuest(false);
    }
  };

  return (
    <AuthFormLayout
      title="Welcome back"
      description="Sign in to continue your reading journey."
      mode="login"
      footer={
        <AuthFooterLink
          text="Don't have an account?"
          linkText="Create one"
          to={ROUTES.REGISTER}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" error={errors.email?.message} htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            error={errors.password?.message}
            {...register('password')}
          />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={isLoggingInGuest}>
          Sign in
        </Button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center animate-pulse">
            <span className="w-full border-t border-border/80" />
          </div>
          <span className="relative bg-card px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            or preview the app
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-primary/45 hover:border-primary bg-transparent text-primary hover:bg-primary/5 transition-all duration-200"
          size="lg"
          onClick={handleGuestLogin}
          disabled={isLoggingInGuest || loading}
        >
          {isLoggingInGuest ? 'Loading demo...' : 'Browse as Guest'}
        </Button>
      </form>
    </AuthFormLayout>
  );
}
