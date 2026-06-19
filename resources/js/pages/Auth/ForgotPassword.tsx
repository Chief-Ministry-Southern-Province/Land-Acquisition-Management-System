import FormField from '@/components/FormField';
import AuthLayout from '@/layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type ForgotPasswordProps = {
  status?: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
  const { data, setData, post, processing, errors } = useForm({ email: '' });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    post('/forgot-password');
  };

  return (
    <AuthLayout title="Reset password" subtitle="Request a secure password reset link">
      <Head title="Forgot password" />

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

        <div className="flex items-center justify-between gap-3">
          <Link href="/login" className="text-primary text-sm hover:underline">
            Back to sign in
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            Send link
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
