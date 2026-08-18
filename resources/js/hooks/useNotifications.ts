import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { echo } from '@/echo';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  action_url?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read_at?: string | null;
}

export function useNotifications(userId?: number) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    const channelName = `App.Models.User.${userId}`;

    // Subscribe to private channel
    echo.private(channelName).notification((notification: NotificationItem) => {
      console.log('Real-time notification received:', notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      echo.leaveChannel(`private-${channelName}`);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read_at: new Date().toISOString() } : item,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axios.post(`/api/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Re-fetch to sync state if failed
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read_at: item.read_at || new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

    try {
      await axios.post('/api/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Re-fetch to sync state if failed
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}
