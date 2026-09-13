import { router } from '@inertiajs/react';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  Globe,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { login } from '@/services/authService';

function LoginScreen() {
  const { t, locale } = useTranslation();
  useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login(username, password);

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      router.visit('/dashboard');
    } catch (err: any) {
      if (err.response) {
        const data = err.response.data;

        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          setError(firstError as string);
        } else {
          setError(
            data.message ||
              t(
                'login_failed',
                'Sign in failed. Please check your official credentials.',
              ),
          );
        }
      } else {
        setError(
          t(
            'network_error',
            'A network error occurred. Please check your connection and try again.',
          ),
        );
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex min-h-screen flex-col font-sans">
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
            <span>Official Government Portal</span>
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
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Pane - Government Portal Branding & Metrics */}
        <div className="bg-muted/30 dark:bg-muted/10 border-border relative hidden flex-col justify-between overflow-hidden border-r p-8 md:flex md:w-[48%] lg:w-[52%] lg:p-12 xl:w-[55%] xl:p-16">
          {/* Cadastral Grid Motif Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-10"
            style={{
              backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 flex h-full flex-col justify-between space-y-8">
            {/* System Logo Bar */}
            <div className="space-y-6">
              <div className="bg-primary text-primary-foreground flex max-w-fit items-center gap-3.5 rounded-xl px-4 py-3 shadow-md">
                <img
                  src="/logo.png"
                  alt="Land Acquisition Management Logo"
                  className="h-10 w-10 shrink-0 rounded bg-white object-contain p-0.5 shadow-sm"
                />
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider">
                    {t('system_brand', 'Land Acquisition Management')}
                  </span>
                  <span className="text-primary-foreground/80 block text-[10px] font-medium">
                    Chief Ministry — Southern Province
                  </span>
                </div>
              </div>
            </div>

            {/* Core Slogan & Info */}
            <div className="my-auto max-w-lg space-y-6">
              <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                <Building2 className="h-3.5 w-3.5" />
                <span>Southern Provincial Council Platform</span>
              </div>

              <h1 className="text-foreground text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl xl:text-5xl">
                {t('digitalizing_nation', 'Digitalizing Land Acquisition &')}
                <span className="text-primary mt-1 block">
                  {t('land_acquisition', 'Provincial Spatial Governance')}
                </span>
              </h1>

              <p className="text-muted-foreground text-sm leading-relaxed lg:text-base">
                {t(
                  'platform_desc',
                  'Centralized government portal for statutory land acquisitions, valuation tracking, public notices, and compensation workflows under the Land Acquisition Act.',
                )}
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Land Acquisition Act Cap 460</span>
                </div>
                <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Divisional Secretariat Integration</span>
                </div>
                <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Valuation Audit Compliance</span>
                </div>
                <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>GIS Cadastral Survey Mapping</span>
                </div>
              </div>
            </div>

            {/* Metrics & Notice */}
            <div className="border-border space-y-6 border-t pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border-border shadow-xs rounded-xl border p-3.5">
                  <div className="text-primary text-xl font-bold lg:text-2xl">
                    4,800+
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {t('processed_cases', 'Parcels Managed')}
                  </div>
                </div>
                <div className="bg-card border-border shadow-xs rounded-xl border p-3.5">
                  <div className="text-xl font-bold text-emerald-600 lg:text-2xl dark:text-emerald-400">
                    99.9%
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {t('uptime_status', 'Audit Verified')}
                  </div>
                </div>
                <div className="bg-card border-border shadow-xs rounded-xl border p-3.5">
                  <div className="text-foreground text-xl font-bold lg:text-2xl">
                    24/7
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {t('legal_audit', 'Legal Audit')}
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground text-[11px] leading-snug">
                Official Portal of Chief Ministry, Southern Provincial Council
                Sri Lanka.
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Authentication Form */}
        <div className="bg-card relative flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="mx-auto my-auto w-full max-w-md space-y-8 py-6">
            {/* Header for Mobile / Main Form */}
            <div>
              {/* Mobile Header Logo */}
              <div className="mb-6 flex items-center gap-3 md:hidden">
                <div className="bg-primary text-primary-foreground flex items-center gap-2.5 rounded-lg px-3 py-2 shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Land Acquisition Management Logo"
                    className="h-8 w-8 shrink-0 rounded bg-white object-contain p-0.5"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    LAMS — Southern Province
                  </span>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="bg-primary ring-primary/20 inline-block h-2.5 w-2.5 rounded-full ring-4" />
                <span className="text-primary text-xs font-bold uppercase tracking-wider">
                  Officer Gateway
                </span>
              </div>

              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {t('personnel_sign_in', 'Personnel Sign In')}
              </h1>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
                {t(
                  'enter_credentials_text',
                  'Enter your official credentials to access the Land Acquisition Management System.',
                )}
              </p>
            </div>

            {/* Secure Session Notice */}
            <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-xl border p-4">
              <ShieldCheck className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h4 className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('secure_session', 'Authorized Government Workstation')}
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                  {t(
                    'secure_session_text',
                    'Your authentication session is secured via TLS 1.3 encryption.',
                  )}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-xl border p-4 text-xs sm:text-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-semibold uppercase tracking-wider">
                  {t('email_address', 'Official Email Address')}
                </label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    {t('security_password', 'Security Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => router.visit('/forgot-password')}
                    className="text-primary text-xs font-semibold transition-colors hover:underline focus:outline-none"
                  >
                    {t('forgot_password', 'Forgot Password?')}
                  </button>
                </div>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-3 pl-10 pr-10 text-sm transition-all focus:outline-none focus:ring-2"
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer select-none items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="border-border bg-input-background text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer rounded"
                    disabled={isLoading}
                  />
                  <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                    {t(
                      'remember_workstation',
                      'Remember this official workstation',
                    )}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner type="pulse" variant="white" size="xs" />
                    <span>{t('signing_in', 'Signing in...')}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {t('sign_in_to_dashboard', 'Sign In to Dashboard')}
                    </span>
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Help Support Link */}
            <div className="border-border text-muted-foreground flex items-center justify-center gap-2 border-t pt-6 text-xs">
              <HelpCircle className="text-primary h-4 w-4 shrink-0" />
              <span>{t('need_assistance', 'Need official assistance?')}</span>
              <a
                href="mailto:support@southerndept.gov.lk"
                className="text-primary font-semibold transition-colors hover:underline"
              >
                {t('contact_support', 'Contact Support Desk')}
              </a>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-border text-muted-foreground mx-auto w-full max-w-md space-y-3 border-t pt-6 text-[11px]">
            <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
              <span>
                &copy; 2026 Chief Ministry — Southern Provincial Council
              </span>
              <div className="flex items-center gap-3 font-medium">
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('support_desk', 'Support')}
                </a>
                <span>•</span>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('data_privacy', 'Privacy')}
                </a>
                <span>•</span>
                <a href="#" className="hover:text-foreground transition-colors">
                  {t('system_audit', 'Audit')}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 font-mono text-[10px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>
                {t('production_environment', 'Production Environment')} v2.4.0
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
