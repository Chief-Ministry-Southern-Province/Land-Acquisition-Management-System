import { usePage, router } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import MainLayout from '@/layouts/MainLayout';

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const { props } = usePage();
  const auth = props.auth as any;

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(auth?.user?.id);

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
        ? notifications.filter((n) => !n.read_at)
        : notifications.filter((n) => n.type === filter);

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle2, color: 'text-emerald-500' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-500' };
      case 'error':
        return { icon: XCircle, color: 'text-rose-500' };
      default:
        return { icon: Info, color: 'text-primary' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted-foreground mt-1">
            System alerts and updates ({unreadCount} unread)
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="border-border hover:bg-muted cursor-pointer rounded-lg border px-4 py-2 transition-colors"
        >
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-border border-b">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'success', label: 'Success' },
            { id: 'warning', label: 'Warnings' },
            { id: 'error', label: 'Errors' },
            { id: 'info', label: 'Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                filter === tab.id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => {
          const { icon: Icon, color } = getIconConfig(notification.type);

          return (
            <div
              key={notification.id}
              onClick={() => {
                markAsRead(notification.id);

                if (notification.action_url) {
                  router.visit(notification.action_url);
                }
              }}
              className={`bg-card border-border cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md ${
                !notification.read_at ? 'border-l-primary border-l-4' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`bg-muted rounded-lg p-2 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <h4 className="text-sm font-semibold">
                      {notification.title}
                    </h4>
                    {!notification.read_at && (
                      <div className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {notification.message}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="bg-card border-border rounded-lg border p-12 text-center">
            <Bell className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

Notifications.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
