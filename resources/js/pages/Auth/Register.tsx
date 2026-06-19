import FormField from '@/components/FormField';
import AuthLayout from '@/layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    post('/register', {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <AuthLayout title="Create account" subtitle="Access the land acquisition workspace">
      <Head title="Register" />

      <form onSubmit={submit} className="space-y-4">
        <FormField
          id="name"
          label="Name"
          value={data.name}
          autoComplete="name"
          error={errors.name}
          onChange={(event) => setData('name', event.target.value)}
          required
        />
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

        <div className="flex items-center justify-between gap-3">
          <Link href="/login" className="text-primary text-sm hover:underline">
            Already registered?
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            Register
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
