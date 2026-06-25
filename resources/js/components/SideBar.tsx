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
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SideBar() {
  const { url } = usePage();
  const { t } = useTranslation();

  const [userRole] = useState('System Administrator');

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    localStorage.removeItem('auth_token');
    router.visit('/login');
  };

  const menuItems = [
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
    { path: '/approval-workflow', icon: CheckSquare, label: t('approvals') },
    { path: '/reports', icon: BarChart3, label: t('reports') },
    { path: '/user-management', icon: UserCog, label: t('user_management') },
    { path: '/audit-log', icon: History, label: t('audit_log') },
    { path: '/notifications', icon: Bell, label: t('notifications') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <>
      {/* Logo */}
      <div className="border-border bg-primary flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
            <span className="text-primary font-bold">LA</span>
          </div>
          <span className="text-white">LAMS</span>
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive
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
            <p className="truncate text-sm">Admin User</p>
            <p className="text-muted-foreground truncate text-xs">
              {userRole} {/*IMPLEMENT Administrator*/}
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
