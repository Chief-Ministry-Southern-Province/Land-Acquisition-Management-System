import { router } from '@inertiajs/react';
import { ArrowLeft, Home, LogIn, ShieldAlert } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

function AccessDenied() {
  const { t } = useTranslation();

  return (
    <div className="bg-background text-foreground from-background via-card to-muted/30 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br transition-colors">
      {/* Top right theme switcher */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <ThemeSwitcher />
      </div>

      {/* Decorative floating circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 dark:bg-primary/10 absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full" />
        <div className="bg-primary/5 dark:bg-primary/10 absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full [animation-delay:1s]" />
        <div className="bg-primary/5 dark:bg-primary/10 absolute right-1/4 top-1/3 h-40 w-40 animate-pulse rounded-full [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-card border-border rounded-2xl border p-10 text-center shadow-2xl">
          {/* Icon */}
          <div className="bg-destructive/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <ShieldAlert className="text-destructive h-12 w-12" />
          </div>

          {/* 403 Heading */}
          <h1 className="text-destructive/20 mb-2 select-none text-8xl font-extrabold leading-none">
            403
          </h1>
          <h2 className="text-foreground mb-2 text-2xl font-semibold">
            {t('access_restricted_title', 'Access Restricted')}
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-sm text-sm">
            {t(
              'access_restricted_description',
              'You do not have permission or the required role to view this page. If you believe this is an error, please contact your system administrator.',
            )}
          </p>

          {/* Divider */}
          <div className="border-border mb-8 border-t" />

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="border-border hover:bg-muted text-foreground inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('go_back', 'Go Back')}
            </button>

            <button
              type="button"
              onClick={() => router.visit('/')}
              className="border-border hover:bg-muted text-foreground inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
            >
              <LogIn className="h-4 w-4" />
              {t('sign_in', 'Sign In')}
            </button>

            <button
              type="button"
              onClick={() => router.visit('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              {t('dashboard', 'Dashboard')}
            </button>
          </div>

          {/* Footer note */}
          <div className="bg-muted/50 mt-8 rounded-lg p-4">
            <p className="text-muted-foreground text-xs">
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

export default AccessDenied;
