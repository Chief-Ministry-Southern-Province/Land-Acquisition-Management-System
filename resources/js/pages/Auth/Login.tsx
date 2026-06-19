import FormField from '@/components/FormField';
import AuthLayout from '@/layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import type { FormEvent } from 'react';

type LoginProps = {
  canResetPassword: boolean;
  status?: string;
};

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

export default function Login({ canResetPassword, status }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    post('/login', {
      onFinish: () => reset('password'),
    });
  };

  return (
    <AuthLayout
      title="Land Acquisition Management System"
      subtitle="Government of Sri Lanka"
    >
      <Head title="Sign in" />

      {status && (
        <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          {status}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={data.email}
          autoComplete="username"
          error={errors.email}
          onChange={(event) => setData('email', event.target.value)}
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={data.password}
          autoComplete="current-password"
          error={errors.password}
          onChange={(event) => setData('password', event.target.value)}
          required
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.remember}
              onChange={(event) => setData('remember', event.target.checked)}
              className="text-primary border-border focus:ring-primary h-4 w-4 rounded"
            />
            Remember me
          </label>

          {canResetPassword && (
            <Link href="/forgot-password" className="text-primary text-sm hover:underline">
              Forgot password?
            </Link>
          )}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn className="h-5 w-5" />
          <span>{processing ? 'Signing in...' : 'Sign in'}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
