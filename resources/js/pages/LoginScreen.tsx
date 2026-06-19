import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn } from 'lucide-react';
import type { FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

type LoginScreenProps = {
  canResetPassword: boolean;
  status?: string;
};

type LoginFormData = {
  email: string;
  password: string;
  remember: boolean;
};

function LoginScreen({ canResetPassword, status }: LoginScreenProps) {
  const { t } = useTranslation();

  const { data, setData, post, processing, errors, reset } = useForm<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/login', {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="from-primary to-primary/80 bg-linear-to-br flex min-h-screen items-center justify-center relative">
      <Head title={t('sign_in')} />

      <div className="absolute top-4 right-4 flex gap-2">
        <Link href="/lang/en" className="bg-white/20 hover:bg-white/30 rounded px-3 py-1 text-sm text-white transition-colors">EN</Link>
        <Link href="/lang/si" className="bg-white/20 hover:bg-white/30 rounded px-3 py-1 text-sm text-white transition-colors">සිං</Link>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg p-8 shadow-xl">
          {/* Logo and Title */}
          <div className="mb-8 text-center">
            <div className="bg-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <span className="text-3xl text-white">LA</span>
            </div>
            <h1 className="mb-2 text-2xl">
              {t('Land_Acquisition_Management_System')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('government_of_sri_lanka')}
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {status}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm">{t('username')}</label>
              <input
                type="email"
                id="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                placeholder={t('username')}
                autoComplete="username"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm">{t('password')}</label>
              <input
                type="password"
                id="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                placeholder={t('password')}
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="text-primary border-border focus:ring-primary h-4 w-4 rounded"
                />
                <span className="text-sm">{t('remember_me')}</span>
              </label>

              {canResetPassword && (
                <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                  {t('forgot_password')}
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn className="h-5 w-5" />
              <span>{processing ? `${t('sign_in')}...` : t('sign_in')}</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="bg-muted/50 mt-6 rounded-lg p-4">
            <p className="text-muted-foreground text-center text-xs">
              <strong>{t('security_notice')}</strong>{' '}
              {t('security_notice_text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
