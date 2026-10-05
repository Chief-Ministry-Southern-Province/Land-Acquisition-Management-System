import { router } from '@inertiajs/react';
import { Home, LogOut, RefreshCw, Wrench } from 'lucide-react';
import { useState } from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { logout } from '@/services/authService';

interface MaintenanceProps {
  isAdmin?: boolean;
  userRole?: string | null;
  userName?: string | null;
  isMaintenanceActive?: boolean;
}

export default function Maintenance({
  isAdmin = false,
  userRole,
  userName,
  isMaintenanceActive = true,
}: MaintenanceProps) {
  const { t, locale } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await logout();
    } catch {
      // Ignore network errors on logout during maintenance
    } finally {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-background text-foreground from-background via-card to-muted/30 relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br transition-colors">
      {/* Top right theme switcher and language selector */}
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <ThemeSwitcher />
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

      {/* Decorative floating circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 dark:bg-primary/10 absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full" />
        <div className="bg-primary/5 dark:bg-primary/10 absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full [animation-delay:1s]" />
        <div className="bg-primary/5 dark:bg-primary/10 absolute right-1/4 top-1/3 h-40 w-40 animate-pulse rounded-full [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-card border-border rounded-2xl border p-10 text-center shadow-2xl">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10">
            <Wrench className="h-12 w-12 text-amber-500" />
          </div>

          {/* 503 Heading */}
          <h1 className="mb-2 select-none text-8xl font-extrabold leading-none text-amber-500/20">
            503
          </h1>
          <h2 className="text-foreground mb-2 text-2xl font-semibold">
            {isMaintenanceActive
              ? t('maintenance_page_title', 'Scheduled Maintenance')
              : t('maintenance_page_completed_title', 'System is Operational')}
          </h2>
          <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
            {isMaintenanceActive
              ? t(
                  'maintenance_page_desc',
                  'The Land Acquisition Management System is currently undergoing scheduled maintenance. Please check back shortly.',
                )
              : t(
                  'maintenance_page_completed_desc',
                  'Scheduled maintenance has concluded. All services and features are fully operational.',
                )}
          </p>

          {/* Admin Bypass Notification Card */}
          {isAdmin && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-left text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-semibold">
                {t('admin_bypass_title', 'Administrator Bypass Active')}
              </p>
              <p className="mt-0.5 text-emerald-700/90 dark:text-emerald-400/90">
                {t(
                  'admin_bypass_desc',
                  'You are logged in as Administrator with unrestricted access. You can disable maintenance mode in System Settings.',
                )}
              </p>
            </div>
          )}

          {/* User Role Context Card (for non-admins) */}
          {!isAdmin && userRole && (
            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">
                {t('role_restricted_notice', 'Access Restricted for Your Role')}
              </p>
              <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90">
                {t(
                  'role_restricted_detail',
                  'Your account (:name — :role) is temporarily restricted until maintenance operations conclude.',
                )
                  .replace(':name', userName || 'User')
                  .replace(':role', userRole)}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-border mb-8 border-t" />

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={checking}
              className="border-border hover:bg-muted text-foreground inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`}
              />
              {checking
                ? t('checking', 'Checking...')
                : t('check_status', 'Check Status')}
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => router.visit('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
              >
                <Home className="h-4 w-4" />
                {t('dashboard', 'Dashboard')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {signingOut
                  ? t('signing_out', 'Signing Out...')
                  : t('sign_in', 'Sign In')}
              </button>
            )}
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
