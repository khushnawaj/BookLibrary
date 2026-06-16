import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/authHooks';
import { registerSchema } from '@/schemas';
import { AuthFormLayout, AuthFooterLink } from './AuthFormLayout';
import { FormField } from '@/components/common/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export function RegisterForm() {
  const { register: registerUser, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data;
    void confirmPassword;

    const result = await registerUser(payload);
    if (!result.success) {
      if (result.error?.errors?.length) {
        result.error.errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(result.error?.message || 'Registration failed');
      }
    }
  };

  return (
    <AuthFormLayout
      title="Create your account"
      description="Join ShelfForge and start building your library."
      mode="register"
      footer={
        <AuthFooterLink
          text="Already have an account?"
          linkText="Sign in"
          to={ROUTES.LOGIN}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Full name" error={errors.name?.message} htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register('name')}
          />
        </FormField>

        <FormField label="Username" error={errors.username?.message} htmlFor="username">
          <Input
            id="username"
            autoComplete="username"
            placeholder="janedoe"
            error={errors.username?.message}
            {...register('username')}
          />
        </FormField>

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
            autoComplete="new-password"
            placeholder="Password"
            error={errors.password?.message}
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm password"
          error={errors.confirmPassword?.message}
          htmlFor="confirmPassword"
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthFormLayout>
  );
}
