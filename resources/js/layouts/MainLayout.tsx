import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronRight, Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';

import SideBar from '@/components/SideBar';
import { useTranslation } from '@/hooks/useTranslation';

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { locale } = useTranslation();
  const { url } = usePage();

  const getBreadcrumbs = () => {
    // remove query parameters if any
    const pathname = url.split('?')[0];
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/dashboard' }];

    // Optional mapping for nicer labels, otherwise fallback to capitalized path
    const labelMapping: Record<string, string> = {
      dashboard: 'Dashboard',
      projects: 'Projects',
      'land-parcels': 'Land Parcels',
      'land-owners': 'Property Owners',
      'acquisition-workflow': 'Workflow',
      documents: 'Documents',
      'gis-maps': 'GIS / Maps',
      'approval-workflow': 'Approvals',
      reports: 'Reports',
      'user-management': 'User Management',
      'audit-log': 'Audit Log',
      notifications: 'Notifications',
      settings: 'Settings',
    };

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label:
          labelMapping[path] ||
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <aside
        className={`bg-card border-border flex flex-col border-r transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <SideBar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-border flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-muted rounded-lg p-2 transition-colors"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-foreground">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switch */}

            {/* Notifications */}
            <button
              onClick={() => router.visit('/notifications')}
              className="hover:bg-muted relative rounded-lg p-2 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="bg-destructive absolute right-1 top-1 h-2 w-2 rounded-full"></span>
            </button>

            {/* User Menu */}
            <button
              onClick={() => router.visit('/settings')}
              className="hover:bg-muted rounded-lg p-2 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              <Link
                href="/lang/en"
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  locale === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                EN
              </Link>
              <Link
                href="/lang/si"
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  locale === 'si'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                සිං
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
