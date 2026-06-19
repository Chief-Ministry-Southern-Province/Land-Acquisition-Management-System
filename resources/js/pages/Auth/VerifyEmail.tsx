import AuthLayout from '@/layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type VerifyEmailProps = {
  status?: string;
};

export default function VerifyEmail({ status }: VerifyEmailProps) {
  const { post, processing } = useForm({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    post('/email/verification-notification');
  };

  return (
    <AuthLayout title="Verify email" subtitle="Confirm your address to continue">
      <Head title="Email verification" />

      <p className="text-muted-foreground mb-4 text-sm">
        We sent a verification link to your email address. Use the button below if
        you need another copy.
      </p>

      {status === 'verification-link-sent' && (
        <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          A new verification link has been sent.
        </div>
      )}

      <form onSubmit={submit} className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={processing}
          className="bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          Resend email
        </button>
        <Link
          href="/logout"
          method="post"
          as="button"
          className="text-destructive text-sm hover:underline"
        >
          Log out
        </Link>
      </form>
    </AuthLayout>
  );
}
