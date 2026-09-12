import {
  Users,
  ShieldCheck,
  Activity,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { getAdminStats } from '@/services/adminStatsService';
import type { AdminStats } from '@/services/adminStatsService';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      change: statsData?.logs_rate
        ? t('logs_normal_rate', statsData.logs_rate)
        : t('logs_normal_rate', 'Normal rate'),
      icon: Activity,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
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

        {/* Security Log Summary */}
        <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              {t('active_server_alerts', 'Active Server Alerts')}
            </h2>
            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
              {t('all_secure', 'All Secure')}
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="flex gap-3 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-0.5">
                <p className="text-foreground font-medium">
                  {t('high_memory_load_warning', 'High memory load warning')}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t(
                    'high_memory_load_desc',
                    'Database indices loading. Resolved automatically in 4m.',
                  )}
                </p>
              </div>
            </div>
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
