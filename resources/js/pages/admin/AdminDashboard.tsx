import {
  Users,
  ShieldCheck,
  Activity,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

export default function AdminDashboard() {
  const adminStats = [
    {
      title: 'Active Users',
      value: '12',
      change: '+2 this week',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'System Logs (24h)',
      value: '2,484',
      change: 'Normal rate',
      icon: Activity,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      title: 'Pending Requests',
      value: '5',
      change: 'Needs review',
      icon: FileText,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-muted-foreground text-sm">
          Overview of system statistics, user activities, and main server
          configuration options.
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
            Quick Management Actions
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
                  Create User Profile
                </h4>
                <p className="text-muted-foreground text-xs">
                  Register new operational, financial, or management users.
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
                  Configure System Access
                </h4>
                <p className="text-muted-foreground text-xs">
                  Modify permissions, reset passwords, or lock inactive
                  profiles.
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Security Log Summary */}
        <div className="bg-card border-border space-y-4 rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              Active Server Alerts
            </h2>
            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
              All Secure
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="flex gap-3 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-0.5">
                <p className="text-foreground font-medium">
                  High memory load warning
                </p>
                <p className="text-muted-foreground text-xs">
                  Database indices loading. Resolved automatically in 4m.
                </p>
              </div>
            </div>
            <div className="border-border flex gap-3 border-t pt-3.5 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <div className="space-y-0.5">
                <p className="text-foreground font-medium">
                  Daily backup verification
                </p>
                <p className="text-muted-foreground text-xs">
                  Database backup successfully synchronized to secondary
                  storage.
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
