import {
  Users,
  ShieldCheck,
  Activity,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Unlock,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { alertError, alertSuccess, confirmAction } from '@/lib/alerts';
import { getAdminStats } from '@/services/adminStatsService';
import type { AdminStats, BlockedUserInfo } from '@/services/adminStatsService';
import { unblockUser } from '@/services/userManagementService';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAdminStats()
      .then((data) => {
        if (isMounted) {
          setStatsData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch admin stats:', err);

        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshStats = async () => {
    try {
      const data = await getAdminStats();
      setStatsData(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to refresh admin stats:', err);
      setIsLoading(false);
    }
  };

  const handleUnblock = async (user: BlockedUserInfo) => {
    const confirmed = await confirmAction({
      title: t('unblock_user', 'Unblock User'),
      text: `Are you sure you want to lift the temporary rate-limit block for "${user.user_name}"?`,
      confirmButtonText: t('unblock_user', 'Unblock User'),
    });

    if (!confirmed) {
      return;
    }

    try {
      setUnblockingId(user.user_id);
      await unblockUser(user.user_id);
      alertSuccess(t('user_unblocked_success', 'User successfully unblocked.'));
      await refreshStats();
    } catch (err: any) {
      console.error('Failed to unblock user:', err);
      alertError(err?.response?.data?.message || 'Failed to unblock user.');
    } finally {
      setUnblockingId(null);
    }
  };

  const hasActiveBlocks = (statsData?.active_blocked_count ?? 0) > 0;
  const hasRecentBreaches = (statsData?.rate_limit_warnings_24h ?? 0) > 0;

  const adminStats = [
    {
      title: t('active_users', 'Active Users'),
      value: isLoading
        ? '...'
        : (statsData?.active_users ?? 0).toLocaleString(),
      change: statsData?.active_users_change
        ? t('active_users_change', statsData.active_users_change)
        : t('active_users_change', '+0 this week'),
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: t('system_logs_24h', 'System Logs (24h)'),
      value: isLoading
        ? '...'
        : (statsData?.system_logs_24h ?? 0).toLocaleString(),
      change: hasActiveBlocks
        ? `${statsData?.active_blocked_count} blocked officer(s)`
        : statsData?.logs_rate
          ? t('logs_normal_rate', statsData.logs_rate)
          : t('logs_normal_rate', 'Normal rate'),
      icon: Activity,
      color: hasActiveBlocks
        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        : hasRecentBreaches
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      title: t('pending_requests', 'Pending Requests'),
      value: isLoading
        ? '...'
        : (statsData?.pending_requests ?? 0).toLocaleString(),
      change: statsData?.pending_requests_change
        ? t('needs_review', statsData.pending_requests_change)
        : t('needs_review', 'Needs review'),
      icon: FileText,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {t('admin_control_center', 'Admin Control Center')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t(
            'admin_dashboard_subtitle',
            'Overview of system statistics, user activities, and main server configuration options.',
          )}
        </p>
      </div>

      {/* Prominent Rate Limit Warning Banner */}
      {hasActiveBlocks && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 shadow-sm dark:bg-rose-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="rounded-lg bg-rose-500/20 p-2.5 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-rose-900 dark:text-rose-100">
                    {t(
                      'rate_limit_security_warning',
                      'Security Alert: Rate Limit Block Active',
                    )}
                  </h3>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    {statsData?.active_blocked_count}{' '}
                    {statsData?.active_blocked_count === 1 ? 'User' : 'Users'}{' '}
                    Blocked
                  </span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  {t(
                    'rate_limit_warning_desc',
                    'Abnormal request volumes detected exceeding system safety thresholds. Impacted users are temporarily restricted from executing operations.',
                  )}
                </p>
              </div>
            </div>
            <a
              href="/audit-log"
              className="bg-background/60 hover:bg-background inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-700 transition dark:text-rose-300"
            >
              <span>{t('view_audit_logs', 'View Audit Logs')}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Blocked Users Table/List */}
          <div className="bg-background/50 mt-4 divide-y divide-rose-500/20 rounded-lg border border-rose-500/20">
            {statsData?.active_blocked_users?.map((user) => (
              <div
                key={user.user_id}
                className="flex flex-col gap-3 p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                  <div>
                    <p className="text-foreground font-semibold">
                      {user.user_name}{' '}
                      <span className="text-muted-foreground text-xs font-normal">
                        ({user.user_email})
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Exceeded:{' '}
                      <span className="font-medium text-rose-600 dark:text-rose-400">
                        {user.operation_name || user.operation}
                      </span>
                      {user.ip && ` • IP: ${user.ip}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {user.retry_after && (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.ceil(user.retry_after / 60)}m left
                    </span>
                  )}
                  <button
                    onClick={() => handleUnblock(user)}
                    disabled={unblockingId === user.user_id}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
                  >
                    {unblockingId === user.user_id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                    <span>{t('unblock_user', 'Unblock')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminStats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div
              key={i}
              className="bg-card border-border flex items-center justify-between rounded-xl border p-6 shadow-sm"
            >
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Administration Zones */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
          <h2 className="text-foreground text-lg font-semibold">
            {t('quick_mgmt_actions', 'Quick Management Actions')}
          </h2>
          <div className="grid gap-4">
            <a
              href="/user-management/add"
              className="border-border/50 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
            >
              <div className="bg-primary/10 text-primary mt-0.5 rounded p-2">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-foreground text-sm font-medium">
                  {t('create_user_profile', 'Create User Profile')}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {t(
                    'create_user_profile_desc',
                    'Register new operational, financial, or management users.',
                  )}
                </p>
              </div>
            </a>

            <a
              href="/user-management"
              className="border-border/50 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
            >
              <div className="bg-primary/10 text-primary mt-0.5 rounded p-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-foreground text-sm font-medium">
                  {t('configure_sys_access', 'Configure System Access')}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {t(
                    'configure_sys_access_desc',
                    'Modify permissions, reset passwords, or lock inactive profiles.',
                  )}
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Security & Rate Limiting Alerts */}
        <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              {t('active_server_alerts', 'Active Server Alerts')}
            </h2>
            {hasActiveBlocks ? (
              <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {t('action_required', 'Action Required')}
              </span>
            ) : hasRecentBreaches ? (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {t('caution', 'Caution')}
              </span>
            ) : (
              <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                {t('all_secure', 'All Secure')}
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            {/* Dynamic Rate Limit Warning Item */}
            {hasActiveBlocks ? (
              <div className="flex gap-3 text-sm">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-600 dark:text-rose-400">
                    {t(
                      'rate_limit_abuse_warning',
                      'Rate Limit Enforcement Triggered',
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {statsData?.active_blocked_count} user(s) currently blocked
                    for abnormal activity:{' '}
                    {statsData?.active_blocked_users
                      ?.map((u) => u.user_name)
                      .join(', ')}
                    .
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="/audit-log"
                      className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Inspect incident logs →
                    </a>
                  </div>
                </div>
              </div>
            ) : hasRecentBreaches ? (
              <div className="flex gap-3 text-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="space-y-0.5">
                  <p className="text-foreground font-medium">
                    {t(
                      'rate_limit_recent_breach',
                      'Rate Limit Breach Logged (24h)',
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {statsData?.rate_limit_warnings_24h} threshold breach
                    event(s) recorded in security logs during the last 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 text-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div className="space-y-0.5">
                  <p className="text-foreground font-medium">
                    {t(
                      'rate_limit_monitoring_active',
                      'Rate Limit Protection Active',
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t(
                      'rate_limit_normal_desc',
                      'All operational request volumes are normal. Zero rate abuse blocks detected.',
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Daily Backup Status */}
            <div className="border-border flex gap-3 border-t pt-3.5 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div className="space-y-0.5">
                <p className="text-foreground font-medium">
                  {t('daily_backup_verification', 'Daily backup verification')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t(
                    'daily_backup_desc',
                    'Database backup successfully synchronized to secondary storage.',
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

AdminDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
