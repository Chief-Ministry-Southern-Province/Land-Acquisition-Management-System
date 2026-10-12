import api from './api';

export interface BlockedUserInfo {
  user_id: number;
  user_name: string;
  user_email: string;
  operation: string;
  operation_name?: string;
  blocked_until?: string;
  retry_after?: number;
  ip?: string;
}

export interface RateLimitAlertItem {
  id: number;
  user_id: number | null;
  name: string;
  action: string;
  detail: string;
  ip_address: string;
  created_at: string;
}

export interface AdminStats {
  active_users: number;
  active_users_change: string;
  system_logs_24h: number;
  logs_rate: string;
  pending_requests: number;
  pending_requests_change: string;
  active_blocked_count?: number;
  active_blocked_users?: BlockedUserInfo[];
  rate_limit_warnings_24h?: number;
  rate_limit_status?: 'normal' | 'caution' | 'warning';
  recent_rate_limit_alerts?: RateLimitAlertItem[];
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/api/admin/stats');

  return response.data.stats;
};
