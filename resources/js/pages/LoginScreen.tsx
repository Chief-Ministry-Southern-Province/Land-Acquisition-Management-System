import { router } from '@inertiajs/react';
import {
  Loader2,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  Globe,
  Landmark,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

function LoginScreen() {
  const { t, locale } = useTranslation();

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
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
                'login_failed',
                'Sign in failed. Please check your credentials.',
              ),
          );
        }

        setIsLoading(false);

        return;
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      router.visit('/dashboard');
    } catch {
      setError(
        t(
          'network_error',
          'A network error occurred. Please check your connection and try again.',
        ),
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      {/* Left Pane - Hero Banner */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white md:flex md:w-[45%] lg:w-[50%] xl:w-[55%]">
        {/* Background Image with Dark Overlay */}
        <img
          src="/images/login_city_bg.png"
          alt="LAMS Background Image"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35 mix-blend-luminosity"
        />
        <div className="bg-linear-to-br to-slate-950/98 absolute inset-0 z-10 from-blue-900/90 via-slate-950/95" />

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-between gap-12">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              LandPath
            </span>
          </div>

          {/* Slogan and Description */}
          <div className="my-auto space-y-6">
            <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
              {t('digitalizing_nation')}{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-blue-400 text-transparent">
                {t('land_acquisition')}
              </span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-slate-300 lg:text-base">
              {t('platform_desc')}
            </p>
          </div>

          {/* Statistics and Official Notice */}
          <div className="space-y-8">
            <div className="grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <div className="text-2xl font-bold text-white lg:text-3xl">
                  4.8k+
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">
                  {t('processed_cases')}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white lg:text-3xl">
                  99.9%
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">
                  {t('uptime_status')}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white lg:text-3xl">
                  24/7
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">
                  {t('legal_audit')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Globe className="h-4 w-4 text-slate-400" />
              <span>{t('official_gov_portal')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form & Credentials */}
      <div className="bg-card relative flex w-full flex-col justify-between p-8 md:w-[55%] md:p-12 lg:w-[50%] lg:p-16 xl:w-[45%]">
        {/* Language Selector */}
        <div className="border-border/50 absolute right-6 top-6 flex items-center gap-1.5 rounded-full border bg-slate-100 p-1 dark:bg-slate-900">
          <a
            href="/lang/en"
            className={`duration-250 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              locale === 'en'
                ? 'shadow-xs bg-blue-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </a>
          <a
            href="/lang/si"
            className={`duration-250 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              locale === 'si'
                ? 'shadow-xs bg-blue-600 text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            සිං
          </a>
        </div>

        {/* Vertical alignment wrapper */}
        <div className="mx-auto my-auto flex w-full max-w-md flex-col justify-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-2xl font-bold tracking-tight">
              {t('personnel_sign_in')}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('enter_credentials_text')}
            </p>
          </div>

          {/* Secure Session Notice */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                {t('secure_session')}
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed text-blue-800 dark:text-blue-400/90">
                {t('secure_session_text')}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                {/* {t('officer_id_username')} */}
                {t('email_address')}
              </label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input-background border-border w-full rounded-xl border py-3 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  placeholder={t('email_placeholder')}
                  // placeholder={t('username_placeholder')}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  {t('security_password')}
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  {t('forgot_password')}
                </a>
              </div>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-background border-border w-full rounded-xl border py-3 pl-10 pr-10 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
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
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="border-border h-4 w-4 cursor-pointer rounded-md text-blue-600 transition-all focus:ring-blue-500/20"
                  disabled={isLoading}
                />
                <span className="text-muted-foreground select-none text-sm font-medium">
                  {t('remember_workstation')}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-blue-700 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('signing_in') || 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{t('sign_in_to_dashboard')}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Help Center */}
          <div className="text-muted-foreground border-border/40 mt-8 flex items-center justify-center gap-2 border-t pt-6 text-xs">
            <HelpCircle className="text-muted-foreground/80 h-4 w-4" />
            <span>{t('need_assistance')}</span>
            <a
              href="#"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              {t('contact_support')}
            </a>
          </div>

          {/* Emblems Section */}
          <div className="mt-8 flex items-center justify-center gap-6">
            {/* Emblem of Sri Lanka (Stylized SVG) */}
            {/* <svg
              width="36"
              height="36"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#D4AF37"
                strokeWidth="4"
                fill="#800000"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#D4AF37"
                strokeWidth="1"
                fill="none"
                strokeDasharray="3 3"
              />
              <path
                d="M40 55 L45 42 L55 42 L60 55 L55 58 L45 58 Z"
                fill="#D4AF37"
              />
              <path
                d="M45 42 L50 32 L55 42"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="48" r="3" fill="#D4AF37" />
              <circle cx="32" cy="50" r="3" fill="#D4AF37" />
              <path
                d="M65 47 A 3 3 0 0 1 68 53"
                stroke="#D4AF37"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg> */}

            {/* Southern Province Emblem (Stylized SVG) */}
            {/* <svg
              width="36"
              height="36"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <polygon
                points="50,10 90,80 10,80"
                stroke="#D4AF37"
                strokeWidth="4"
                fill="#0E4C92"
              />
              <circle cx="50" cy="55" r="14" fill="#D4AF37" />
              <path d="M50 30 L50 45" stroke="#D4AF37" strokeWidth="3" />
              <circle cx="50" cy="30" r="4" fill="#D4AF37" />
            </svg> */}
          </div>
        </div>

        {/* Footer */}
        <div className="border-border/40 mx-auto mt-12 w-full max-w-md border-t pt-8 md:mt-0">
          <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-[10px] lg:flex-row">
            <span className="text-center leading-relaxed lg:text-left">
              &copy; 2026 Chief Ministry Office - Land Acquisition Management
              System (LAMS)
            </span>
            <div className="flex shrink-0 gap-3 font-semibold">
              <a href="#" className="hover:text-foreground transition-colors">
                {t('support_desk')}
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                {t('data_privacy')}
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                {t('system_audit')}
              </a>
            </div>
          </div>
          <div className="text-muted-foreground/80 mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold tracking-wider">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
            <span>{t('production_environment')} v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
