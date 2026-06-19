import FormField from '@/components/FormField';
import MainLayout from '@/layouts/MainLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import type { Auth } from '@/types';

type ProfileProps = {
  mustVerifyEmail: boolean;
  status?: string;
};

type PageProps = {
  auth: Auth;
};

function EditProfile({ mustVerifyEmail, status }: ProfileProps) {
  const { auth } = usePage<PageProps>().props;
  const user = auth.user;

  const profileForm = useForm({
    name: user.name,
    email: user.email,
  });

  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    profileForm.patch('/profile');
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    passwordForm.put('/password', {
      onFinish: () =>
        passwordForm.reset('current_password', 'password', 'password_confirmation'),
    });
  };

  return (
    <div className="space-y-6">
      <Head title="Profile" />

      <div>
        <h1>Profile</h1>
        <p className="text-muted-foreground mt-1">Manage account access and credentials.</p>
      </div>

      <section className="bg-card border-border rounded-lg border p-6">
        <h2 className="mb-4">Profile information</h2>
        <form onSubmit={submitProfile} className="max-w-xl space-y-4">
          <FormField
            id="name"
            label="Name"
            value={profileForm.data.name}
            error={profileForm.errors.name}
            onChange={(event) => profileForm.setData('name', event.target.value)}
            required
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={profileForm.data.email}
            error={profileForm.errors.email}
            onChange={(event) => profileForm.setData('email', event.target.value)}
            required
          />

          {mustVerifyEmail && user.email_verified_at === null && (
            <p className="text-warning text-sm">
              Your email address is unverified.{' '}
              <Link
                href="/email/verification-notification"
                method="post"
                as="button"
                className="underline"
              >
                Resend verification email.
              </Link>
            </p>
          )}

          {status && <p className="text-success text-sm">{status}</p>}

          <button
            type="submit"
            disabled={profileForm.processing}
            className="bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            Save
          </button>
        </form>
      </section>

      <section className="bg-card border-border rounded-lg border p-6">
        <h2 className="mb-4">Update password</h2>
        <form onSubmit={submitPassword} className="max-w-xl space-y-4">
          <FormField
            id="current_password"
            label="Current password"
            type="password"
            value={passwordForm.data.current_password}
            error={passwordForm.errors.current_password}
            onChange={(event) =>
              passwordForm.setData('current_password', event.target.value)
            }
            required
          />
          <FormField
            id="password"
            label="New password"
            type="password"
            value={passwordForm.data.password}
            error={passwordForm.errors.password}
            onChange={(event) => passwordForm.setData('password', event.target.value)}
            required
          />
          <FormField
            id="password_confirmation"
            label="Confirm password"
            type="password"
            value={passwordForm.data.password_confirmation}
            error={passwordForm.errors.password_confirmation}
            onChange={(event) =>
              passwordForm.setData('password_confirmation', event.target.value)
            }
            required
          />
          <button
            type="submit"
            disabled={passwordForm.processing}
            className="bg-primary hover:bg-primary/90 rounded-lg px-5 py-2.5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

EditProfile.layout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;

export default EditProfile;
