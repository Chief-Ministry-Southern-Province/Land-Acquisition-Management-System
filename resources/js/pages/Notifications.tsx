import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Scale,
} from 'lucide-react';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

export default function Notifications() {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'approval',
      title: 'Approval Request',
      message: 'Compensation COMP-3458 requires your approval',
      time: '2 hours ago',
      read: false,
      icon: CheckCircle,
      color: 'text-[#FF9800]',
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Upcoming Deadline',
      message: 'Gazette Notice Publication due on 2024-06-08',
      time: '3 hours ago',
      read: false,
      icon: Clock,
      color: 'text-[#FF9800]',
    },
    {
      id: 3,
      type: 'legal',
      title: 'Court Hearing',
      message: 'Case LEG-2024-023 hearing scheduled for 2024-06-20',
      time: '5 hours ago',
      read: false,
      icon: Scale,
      color: 'text-primary',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Completed',
      message: 'Compensation payment PAY-3457 processed successfully',
      time: '1 day ago',
      read: true,
      icon: CheckCircle,
      color: 'text-[#2E7D32]',
    },
    {
      id: 5,
      type: 'survey',
      title: 'Survey Completed',
      message: 'Survey SUR-2024-154 has been completed',
      time: '1 day ago',
      read: true,
      icon: FileText,
      color: 'text-primary',
    },
    {
      id: 6,
      type: 'alert',
      title: 'Document Required',
      message: 'Missing ownership documents for PCL-8940',
      time: '2 days ago',
      read: true,
      icon: AlertCircle,
      color: 'text-destructive',
    },
    {
      id: 7,
      type: 'approval',
      title: 'Valuation Approved',
      message: 'Valuation VAL-5678 has been approved',
      time: '2 days ago',
      read: true,
      icon: CheckCircle,
      color: 'text-[#2E7D32]',
    },
    {
      id: 8,
      type: 'deadline',
      title: 'Compensation Payment Due',
      message: 'Payment for owners OWN-1248 to OWN-1267 due on 2024-06-15',
      time: '3 days ago',
      read: true,
      icon: Clock,
      color: 'text-[#FF9800]',
    },
  ];

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted-foreground mt-1">
            System alerts and updates ({unreadCount} unread)
          </p>
        </div>
        <button className="border-border hover:bg-muted rounded-lg border px-4 py-2 transition-colors">
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-border border-b">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'approval', label: 'Approvals' },
            { id: 'deadline', label: 'Deadlines' },
            { id: 'legal', label: 'Legal' },
            { id: 'payment', label: 'Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
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
          const Icon = notification.icon;

          return (
            <div
              key={notification.id}
              className={`bg-card border-border cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md ${
                !notification.read ? 'border-l-primary border-l-4' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`bg-muted rounded-lg p-2 ${notification.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <h4 className="text-sm">{notification.title}</h4>
                    {!notification.read && (
                      <div className="bg-primary mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    {notification.message}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {notification.time}
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
