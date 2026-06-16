import { router, Link } from '@inertiajs/react';
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
} from 'lucide-react';

export default function SideBar() {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/land-parcels', icon: Map, label: 'Land Parcels' },
    { path: '/land-owners', icon: Users, label: 'Property Owners' },
    { path: '/acquisition-workflow', icon: GitBranch, label: 'Workflow' },
    { path: '/documents', icon: FolderOpen, label: 'Documents' },
    { path: '/gis-maps', icon: MapPin, label: 'GIS / Maps' },
    { path: '/approval-workflow', icon: CheckSquare, label: 'Approvals' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/user-management', icon: UserCog, label: 'User Management' },
    { path: '/audit-log', icon: History, label: 'Audit Log' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
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
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

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
            <p className="truncate text-sm">Admin User</p>
            <p className="text-muted-foreground truncate text-xs">
              {/* {userRole} */} //IMPLEMENT Administrator
            </p>
          </div>
        </div>
        <button
          onClick={() => router.visit('/login')}
          className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}
