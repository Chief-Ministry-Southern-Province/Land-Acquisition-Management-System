import FormField from '@/components/FormField';
import AuthLayout from '@/layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type ResetPasswordProps = {
  token: string;
  email: string;
};

type ResetPasswordForm = ResetPasswordProps & {
  password: string;
  password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
    token,
    email,
    password: '',
    password_confirmation: '',
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    post('/reset-password', {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a new password for your account">
      <Head title="Reset password" />

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
          autoComplete="new-password"
          error={errors.password}
          onChange={(event) => setData('password', event.target.value)}
          required
        />
        <FormField
          id="password_confirmation"
          label="Confirm password"
          type="password"
          value={data.password_confirmation}
          autoComplete="new-password"
          error={errors.password_confirmation}
          onChange={(event) => setData('password_confirmation', event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={processing}
          className="bg-primary hover:bg-primary/90 w-full rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          Reset password
        </button>
      </form>
    </AuthLayout>
  );
}
