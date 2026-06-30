import { router } from '@inertiajs/react';
import { LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

function LoginScreen() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from Laravel
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          setError(firstError as string);
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }

        return;
      }

      // Store the token for future API requests
      localStorage.setItem('auth_token', data.token);

      // Redirect to dashboard
      router.visit('/dashboard');
    } catch {
      setError(
        'A network error occurred. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="from-primary to-primary/80 bg-linear-to-br relative flex min-h-screen items-center justify-center">
      <div className="absolute right-4 top-4 flex gap-2">
        <a
          href="/lang/en"
          className="rounded bg-white/20 px-3 py-1 text-sm text-white transition-colors hover:bg-white/30"
        >
          EN
        </a>
        <a
          href="/lang/si"
          className="rounded bg-white/20 px-3 py-1 text-sm text-white transition-colors hover:bg-white/30"
        >
          සිං
        </a>
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm">{t('email_address')}</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                placeholder={t('email_address')}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                placeholder={t('password')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="text-primary border-border focus:ring-primary h-4 w-4 rounded"
                  disabled={isLoading}
                />
                <span className="text-sm">{t('remember_me')}</span>
              </label>

              <button
                type="button"
                onClick={() => router.visit('/forgot-password')}
                className="text-primary text-sm hover:underline"
              >
                {t('forgot_password')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              <span>
                {isLoading ? t('signing_in') || 'Signing in...' : t('sign_in')}
              </span>
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
