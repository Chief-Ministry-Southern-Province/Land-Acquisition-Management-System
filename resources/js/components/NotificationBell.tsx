import { router } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface Props {
  userId?: number;
}

export const NotificationBell: React.FC<Props> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);

  // Close notifications list when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted relative rounded-lg p-2 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="bg-destructive absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bg-card border-border absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border shadow-xl sm:w-96">
          <div className="bg-muted/50 border-border flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-foreground text-sm font-semibold">
              Notifications
            </h3>
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
              {unreadCount} New
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No new notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    setIsOpen(false);
                    if (item.action_url) router.visit(item.action_url);
                  }}
                  className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                    !item.read_at ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-semibold truncate">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs break-words">
                      {item.message}
                    </p>
                    <span className="text-muted-foreground mt-1 block text-[10px]">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border p-2 text-center bg-muted/20">
            <button
              onClick={() => {
                setIsOpen(false);
                router.visit('/notifications');
              }}
              className="text-primary text-xs font-medium hover:underline w-full cursor-pointer py-1"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
