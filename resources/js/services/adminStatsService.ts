import api from './api';

export interface AdminStats {
  active_users: number;
  active_users_change: string;
  system_logs_24h: number;
  logs_rate: string;
  pending_requests: number;
  pending_requests_change: string;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/api/admin/stats');

  return response.data.stats;
};
