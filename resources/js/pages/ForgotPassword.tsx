import { router } from '@inertiajs/react';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

function ForgotPassword() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          setError(firstError as string);
        } else {
          setError(
            data.message ||
              t(
                'forgot_password_error',
                'Failed to send reset link. Please try again.',
              ),
          );
        }

        return;
      }

      setIsSuccess(true);
    } catch {
      setError(
        t(
          'network_error',
          'A network error occurred. Please check your connection and try again.',
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="from-primary to-primary/80 bg-linear-to-br relative flex min-h-screen items-center justify-center">
      {/* Language Switcher */}
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
            <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <KeyRound className="text-primary h-10 w-10" />
            </div>
            <h1 className="mb-2 text-2xl">
              {t('forgot_password', 'Forgot Password')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t(
                'forgot_password_description',
                'Enter your email address and we will send you a link to reset your password.',
              )}
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
              {t(
                'reset_link_sent',
                'A password reset link has been sent to your email address. Please check your inbox.',
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Forgot Password Form */}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm">
                  {t('email_address', 'Email Address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('email_address', 'Email Address')}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                <span>
                  {isLoading
                    ? t('sending', 'Sending...')
                    : t('send_reset_link', 'Send Reset Link')}
                </span>
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="border-border hover:bg-muted flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
            >
              <Mail className="h-4 w-4" />
              {t('resend_reset_link', 'Resend Reset Link')}
            </button>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.visit('/')}
              className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back_to_login', 'Back to Sign In')}
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-muted/50 mt-6 rounded-lg p-4">
            <p className="text-muted-foreground text-center text-xs">
              <strong>
                {t(
                  'Land_Acquisition_Management_System',
                  'Land Acquisition Management System',
                )}
              </strong>{' '}
              — {t('government_of_sri_lanka', 'Government of Sri Lanka')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
