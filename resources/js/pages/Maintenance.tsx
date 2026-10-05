import { router } from '@inertiajs/react';
import {
  Wrench,
  Clock,
  RefreshCw,
  LogOut,
  Home,
  Settings,
  ShieldAlert,
  Server,
  UserCheck,
} from 'lucide-react';
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
  const { t, currentLocale, changeLanguage } = useTranslation();
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
      router.visit('/');
    }
  };

  return (
    <div className="bg-background text-foreground from-background via-card to-muted/20 relative flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br font-sans transition-colors selection:bg-amber-500 selection:text-white">
      {/* Top Header Strip */}
      <header className="bg-card/80 border-border relative z-20 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-foreground text-[11px] font-semibold uppercase tracking-wider sm:text-xs">
            {t('gov_sri_lanka', 'Government of Sri Lanka')}
          </span>
          <span className="text-muted-foreground hidden sm:inline">•</span>
          <span className="text-muted-foreground hidden text-xs font-medium sm:inline">
            {t('chief_ministry_sp', 'Chief Ministry — Southern Province')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {/* Language Switcher */}
          <div className="flex gap-1">
            <button
              onClick={() => changeLanguage('en')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                currentLocale === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('si')}
              className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                currentLocale === 'si'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              සිං
            </button>
          </div>
        </div>
      </header>

      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-28 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15" />
        <div className="bg-primary/10 dark:bg-primary/15 absolute -bottom-32 -right-32 h-[30rem] w-[30rem] animate-pulse rounded-full blur-3xl [animation-delay:2s]" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 animate-pulse rounded-full bg-orange-500/10 blur-2xl [animation-delay:4s] dark:bg-orange-500/10" />
      </div>

      {/* Main Content Card */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 items-center justify-center p-4 sm:p-6">
        <div className="bg-card/90 border-border/80 relative w-full overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl transition-all">
          {/* Top Banner Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          <div className="p-6 text-center sm:p-10">
            {/* Status Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              {isMaintenanceActive
                ? t(
                    'maintenance_active_badge',
                    'System Maintenance in Progress',
                  )
                : t('maintenance_resolved_badge', 'Maintenance Concluded')}
            </div>

            {/* Glowing Icon Hub */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-amber-500/20 blur-xl dark:bg-amber-500/30" />
              <div className="bg-card border-border/60 relative flex h-20 w-20 items-center justify-center rounded-2xl border shadow-inner">
                <Wrench className="h-10 w-10 text-amber-500 transition-transform duration-500 hover:rotate-45" />
              </div>
            </div>

            {/* Titles */}
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {isMaintenanceActive
                ? t(
                    'maintenance_page_title',
                    'Scheduled Maintenance in Progress',
                  )
                : t(
                    'maintenance_page_completed_title',
                    'System is Operational',
                  )}
            </h1>

            <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base">
              {isMaintenanceActive
                ? t(
                    'maintenance_page_desc',
                    'The Land Acquisition Management System is currently undergoing routine maintenance and essential database upgrades to enhance stability, performance, and data security.',
                  )
                : t(
                    'maintenance_page_completed_desc',
                    'Scheduled system maintenance has concluded. All services and features are fully operational.',
                  )}
            </p>

            {/* Admin Bypass Notification Card (if visited by admin) */}
            {isAdmin && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left text-xs text-emerald-800 sm:text-sm dark:text-emerald-300">
                <div className="flex items-start gap-3">
                  <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {t('admin_bypass_title', 'Administrator Bypass Active')}
                    </p>
                    <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90">
                      {t(
                        'admin_bypass_desc',
                        'You are logged in with the Administrator role. You have unrestricted access to all modules and can turn maintenance mode off in System Settings.',
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User Role Context Card (for non-admins) */}
            {!isAdmin && userRole && (
              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div className="space-y-1">
                    <p className="text-foreground font-medium">
                      {t(
                        'role_restricted_notice',
                        'Access Restricted for Your Role',
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t(
                        'role_restricted_detail',
                        'Your account (:name — :role) is temporarily restricted until maintenance operations are complete to prevent data inconsistency.',
                      )
                        .replace(':name', userName || 'User')
                        .replace(':role', userRole)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline & Assurances Info Grid */}
            <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              <div className="bg-muted/40 border-border/50 rounded-xl border p-3.5">
                <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{t('maintenance_window', 'Estimated Duration')}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t(
                    'maintenance_window_desc',
                    'Typically completes within 30 to 60 minutes. Please check back shortly.',
                  )}
                </p>
              </div>

              <div className="bg-muted/40 border-border/50 rounded-xl border p-3.5">
                <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
                  <Server className="h-4 w-4 text-emerald-500" />
                  <span>{t('data_safety', 'Data Security')}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t(
                    'data_safety_desc',
                    'All land parcel records, compensations, and documents are securely preserved.',
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={checking}
                className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/40 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-md transition-all disabled:opacity-50 sm:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`}
                />
                {checking
                  ? t('checking_status', 'Checking Status...')
                  : t('check_status', 'Check Status / Refresh')}
              </button>

              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.visit('/dashboard')}
                    className="border-border hover:bg-muted text-foreground inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors sm:w-auto"
                  >
                    <Home className="h-4 w-4" />
                    {t('admin_dashboard', 'Admin Dashboard')}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.visit('/settings')}
                    className="border-border hover:bg-muted text-foreground inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors sm:w-auto"
                  >
                    <Settings className="h-4 w-4" />
                    {t('settings', 'System Settings')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="border-border hover:bg-muted text-foreground inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 sm:w-auto"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut
                    ? t('signing_out', 'Signing Out...')
                    : t('sign_out_or_admin', 'Sign In as Administrator')}
                </button>
              )}
            </div>

            {/* Help / Contact note */}
            <p className="text-muted-foreground mt-8 text-xs">
              {t(
                'maintenance_contact_help',
                'Need urgent assistance? Contact the Provincial IT Department at',
              )}{' '}
              <a
                href="mailto:it@lams.gov.lk"
                className="text-primary font-medium hover:underline"
              >
                it@lams.gov.lk
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/60 bg-card/40 text-muted-foreground relative z-10 border-t py-4 text-center text-xs backdrop-blur-sm">
        <p>
          <strong>
            {t(
              'Land_Acquisition_Management_System',
              'Land Acquisition Management System',
            )}
          </strong>{' '}
          — {t('government_of_sri_lanka', 'Government of Sri Lanka')}
        </p>
      </footer>
    </div>
  );
}
