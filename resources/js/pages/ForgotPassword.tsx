import { router } from '@inertiajs/react';
import {
  Mail,
  ArrowLeft,
  KeyRound,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

function ForgotPassword() {
  const { t, locale } = useTranslation();
  useTheme();

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
                'Failed to send password reset link. Please try again.',
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
    <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative flex min-h-screen flex-col justify-between font-sans">
      {/* Cadastral Grid Motif Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-10"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Official Government Announcement Strip */}
      <header className="bg-card border-border relative z-20 flex h-14 items-center justify-between overflow-visible border-b px-4 text-xs sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-foreground text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
            Government of Sri Lanka
          </span>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <span className="text-muted-foreground hidden font-medium sm:inline">
            Chief Ministry — Southern Province
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-muted-foreground hidden items-center gap-1.5 text-[11px] md:flex">
            <Globe className="text-primary h-3.5 w-3.5" />
            <span>Security Gateway</span>
          </div>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Language Switcher */}
          <div className="flex gap-1.5">
            <a
              href="/lang/en"
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                locale === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              EN
            </a>
            <a
              href="/lang/si"
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                locale === 'si'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              සිං
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-card border-border relative overflow-hidden rounded-2xl border shadow-xl">
            <div className="space-y-6 p-6 sm:p-8">
              {/* Header with System Branding */}
              <div className="space-y-4 text-center">
                <div className="bg-primary text-primary-foreground mx-auto flex max-w-fit items-center gap-3 rounded-xl px-4 py-3 shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Land Acquisition Management Logo"
                    className="h-9 w-9 shrink-0 rounded bg-white object-contain p-0.5 shadow-sm"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold uppercase tracking-wider">
                      {t('system_brand', 'Land Acquisition Management')}
                    </span>
                    <span className="text-primary-foreground/80 block text-[10px] font-medium">
                      Chief Ministry — Southern Province
                    </span>
                  </div>
                </div>

                <div className="bg-primary/10 border-primary/20 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-xl border">
                  <KeyRound className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                    {t('forgot_password', 'Forgot Password')}
                  </h1>
                  <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-xs leading-relaxed sm:text-sm">
                    {t(
                      'forgot_password_description',
                      'Enter your email address and we will send you a link to reset your password.',
                    )}
                  </p>
                </div>
              </div>

              {/* Success Message */}
              {isSuccess && (
                <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-foreground text-xs font-semibold">
                        Reset Link Sent
                      </h4>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        {t(
                          'reset_link_sent',
                          'A password reset link has been sent to your email address. Please check your inbox.',
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-xl border p-4 text-xs sm:text-sm">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {/* Form / Actions */}
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-muted-foreground mb-2 block text-xs font-semibold uppercase tracking-wider">
                      {t('email_address', 'Official Email Address')}
                    </label>
                    <div className="relative">
                      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Mail className="h-4.5 w-4.5" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-3 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2"
                        placeholder={t(
                          'email_placeholder',
                          'officer@southerndept.gov.lk',
                        )}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner
                          type="pulse"
                          variant="white"
                          size="xs"
                        />
                        <span>{t('sending', 'Sending...')}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4.5 w-4.5" />
                        <span>{t('send_reset_link', 'Send Reset Link')}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="border-border bg-card hover:bg-muted text-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition-colors sm:text-sm"
                >
                  <Mail className="text-primary h-4 w-4" />
                  <span>{t('resend_reset_link', 'Resend Reset Link')}</span>
                </button>
              )}

              {/* Back to Sign In */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => router.visit('/')}
                  className="text-primary inline-flex cursor-pointer items-center gap-2 text-xs font-semibold transition-colors hover:underline focus:outline-none sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t('back_to_login', 'Back to Sign In')}</span>
                </button>
              </div>

              {/* Security Audit Note */}
              <div className="bg-muted/50 border-border rounded-xl border p-3 text-center">
                <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-[11px] font-medium">
                  <ShieldCheck className="text-primary h-3.5 w-3.5" />
                  <span>Information Security Notice</span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-[10px] leading-relaxed">
                  Password reset requests are monitored and logged for security
                  compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-border text-muted-foreground relative z-10 border-t px-6 py-4 text-center text-[11px]">
        <p>
          &copy; 2026 Chief Ministry — Southern Provincial Council | Land
          Acquisition Management System (LAMS)
        </p>
      </footer>
    </div>
  );
}

export default ForgotPassword;
