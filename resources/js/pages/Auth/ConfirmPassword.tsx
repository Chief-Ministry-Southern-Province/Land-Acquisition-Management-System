import FormField from '@/components/FormField';
import AuthLayout from '@/layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: '',
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    post('/confirm-password', {
      onFinish: () => reset('password'),
    });
  };

  return (
    <AuthLayout title="Confirm password" subtitle="This area requires a fresh password check">
      <Head title="Confirm password" />

      <form onSubmit={submit} className="space-y-4">
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

        <button
          type="submit"
          disabled={processing}
          className="bg-primary hover:bg-primary/90 w-full rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          Confirm
        </button>
      </form>
    </AuthLayout>
  );
}
