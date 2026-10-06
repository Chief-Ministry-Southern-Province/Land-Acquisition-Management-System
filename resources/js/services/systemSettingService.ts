import api from './api';

export interface SystemSettingsData {
  // General
  system_name?: string;
  org_name?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  currency?: string;

  // Security
  session_timeout?: string | number;
  max_login_attempts?: string | number;
  password_min_length?: string | number;
  two_factor?: boolean;
  enforce_password_expiry?: boolean;
  password_expiry_days?: string | number;
  ip_whitelist?: boolean;

  // Notifications
  email_notifs?: boolean;
  sms_notifs?: boolean;
  system_notifs?: boolean;
  approval_alerts?: boolean;
  deadline_alerts?: boolean;
  daily_digest?: boolean;
  smtp_host?: string;
  smtp_port?: string | number;

  // Automated Backup & Maintenance
  auto_backup?: boolean;
  backup_frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly' | string;
  retention_days?: number;
  audit_log_retention?: number;
  maintenance_mode?: boolean;
  last_auto_backup_at?: string | null;
}

export const getSystemSettings = async (): Promise<SystemSettingsData> => {
  const response = await api.get<{ settings: SystemSettingsData }>(
    '/api/settings',
  );

  return response.data.settings;
};

export const updateSystemSettings = async (
  data: Partial<SystemSettingsData>,
): Promise<{ message: string; settings: SystemSettingsData }> => {
  const response = await api.post<{
    message: string;
    settings: SystemSettingsData;
  }>('/api/settings', data);

  return response.data;
};

export const cleanBackupsNow = async (
  days?: number,
): Promise<{ message: string; result: any; deleted_audit_logs: number }> => {
  const response = await api.post<{
    message: string;
    result: any;
    deleted_audit_logs: number;
  }>('/api/backups/clean', { days });

  return response.data;
};
