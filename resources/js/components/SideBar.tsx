import { router, Link, usePage } from '@inertiajs/react';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  UserCog,
  History,
  Map,
  Users,
  FolderOpen,
  MapPin,
  BarChart3,
  GitBranch,
  CheckSquare,
  FolderKanban,
  DollarSign,
  Building2,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export interface SideBarItem {
  path: string;
  icon: React.ComponentType<{ className?: string }> | LucideIcon;
  label: string;
}

interface SideBarProps {
  items?: SideBarItem[];
}

export default function SideBar({ items }: SideBarProps = {}) {
  const { url, props } = usePage();
  const { t } = useTranslation();

  const user = (props.auth as any)?.user;
  const userName = user?.name || 'User';
  const userRole = user?.role?.role_name || 'User';
  const userRoleFull = user?.role?.description || 'User';

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    localStorage.removeItem('auth_token');
    router.visit('/login');
  };

  // NOTE: Do not remove default items
  const navItemByRole: Record<string, SideBarItem[]> = {
    Admin: [
      {
        path: '/dashboard',
        icon: LayoutDashboard,
        label: 'Admin Dashboard',
      },
      {
        path: '/user-management',
        icon: UserCog,
        label: 'User Management',
      },
      { path: '/departments', icon: Building2, label: 'Departments' },
      { path: '/roles', icon: Shield, label: 'Roles & Permissions' },
      { path: '/audit-log', icon: History, label: 'Audit Logs' },
      { path: '/settings', icon: Settings, label: 'System Settings' },
    ],
    DO: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { path: '/projects', icon: FolderKanban, label: t('projects') },
      { path: '/land-parcels', icon: Map, label: t('land_parcels') },
      { path: '/land-owners', icon: Users, label: t('land_owners') },
      { path: '/documents', icon: FolderOpen, label: t('documents') },
      { path: '/notifications', icon: Bell, label: t('notifications') },
      { path: '/settings', icon: Settings, label: t('settings') },
    ],
    HOB: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { path: '/projects', icon: FolderKanban, label: t('projects') },
      { path: '/land-parcels', icon: Map, label: t('land_parcels') },
      { path: '/land-owners', icon: Users, label: t('land_owners') },
      { path: '/compensation', icon: DollarSign, label: t('compensation') },
      {
        path: '/acquisition-workflow',
        icon: GitBranch,
        label: t('acquisition_workflow'),
      },
      { path: '/documents', icon: FolderOpen, label: t('documents') },
      { path: '/gis-maps', icon: MapPin, label: t('gis_maps') },
      {
        path: '/pending-approvals',
        icon: CheckSquare,
        label: t('approvals'),
      },
      { path: '/reports', icon: BarChart3, label: t('reports') },
    ],
    AO: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { path: '/projects', icon: FolderKanban, label: t('projects') },
      { path: '/land-parcels', icon: Map, label: t('land_parcels') },
      { path: '/land-owners', icon: Users, label: t('land_owners') },
      {
        path: '/pending-approvals',
        icon: CheckSquare,
        label: t('approvals'),
      },
    ],
    AS: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { path: '/projects', icon: FolderKanban, label: t('projects') },
      { path: '/land-parcels', icon: Map, label: t('land_parcels') },
      { path: '/land-owners', icon: Users, label: t('land_owners') },
      {
        path: '/pending-approvals',
        icon: CheckSquare,
        label: t('approvals'),
      },
    ],
    SAS: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { path: '/projects', icon: FolderKanban, label: t('projects') },
      { path: '/land-parcels', icon: Map, label: t('land_parcels') },
      { path: '/land-owners', icon: Users, label: t('land_owners') },
      {
        path: '/pending-approvals',
        icon: CheckSquare,
        label: t('approvals'),
      },
    ],
    SEC: [
      { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
      { path: '/projects', icon: FolderKanban, label: t('projects') },
      { path: '/land-parcels', icon: Map, label: t('land_parcels') },
      { path: '/land-owners', icon: Users, label: t('land_owners') },
      {
        path: '/pending-approvals',
        icon: CheckSquare,
        label: t('approvals'),
      },
    ],
  };

  const defaultItems = navItemByRole[userRole] || navItemByRole['DO'];

  const menuItems = items || defaultItems;

  return (
    <>
      {/* Logo */}
      <div className="border-border bg-primary flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Land Acquisition Management Logo"
            className="h-9 w-9 rounded bg-white object-contain p-0.5 shadow-sm"
          />
          <span className="text-xs font-semibold uppercase leading-snug tracking-wide text-white">
            Land Acquisition
            <br />
            Management
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              url === item.path ||
              (item.path !== '/' && url.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="border-border border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{userName}</p>
            <p className="text-muted-foreground truncate text-xs">
              {userRoleFull}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </>
  );
}
