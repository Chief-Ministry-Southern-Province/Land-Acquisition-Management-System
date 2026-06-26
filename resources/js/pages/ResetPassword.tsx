import { router, usePage } from '@inertiajs/react';
import { KeyRound, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface ResetPasswordProps {
  token: string;
  email: string;
  [key: string]: unknown;
}

function ResetPassword() {
  const { t } = useTranslation();
  const { token, email: initialEmail } = usePage<ResetPasswordProps>().props;

  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError(
        t('passwords_do_not_match', 'Passwords do not match.'),
      );

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
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
                'reset_password_error',
                'Failed to reset password. Please try again.',
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
              {isSuccess ? (
                <ShieldCheck className="text-primary h-10 w-10" />
              ) : (
                <KeyRound className="text-primary h-10 w-10" />
              )}
            </div>
            <h1 className="mb-2 text-2xl">
              {isSuccess
                ? t('password_reset_success_title', 'Password Reset!')
                : t('reset_password', 'Reset Password')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSuccess
                ? t(
                    'password_reset_success_description',
                    'Your password has been successfully reset. You can now sign in with your new password.',
                  )
                : t(
                    'reset_password_description',
                    'Enter your new password below to complete the reset.',
                  )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Reset Password Form */}
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

              <div>
                <label className="mb-2 block text-sm">
                  {t('new_password', 'New Password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 pr-10 focus:outline-none focus:ring-2"
                    placeholder={t('new_password', 'New Password')}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm">
                  {t('confirm_password', 'Confirm Password')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmation ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 pr-10 focus:outline-none focus:ring-2"
                    placeholder={t('confirm_password', 'Confirm Password')}
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(!showConfirmation)}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showConfirmation ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <KeyRound className="h-5 w-5" />
                )}
                <span>
                  {isLoading
                    ? t('resetting', 'Resetting...')
                    : t('reset_password_button', 'Reset Password')}
                </span>
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => router.visit('/')}
              className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t('go_to_sign_in', 'Go to Sign In')}
            </button>
          )}

          {/* Back to Login (only when form is visible) */}
          {!isSuccess && (
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
          )}

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

export default ResetPassword;
