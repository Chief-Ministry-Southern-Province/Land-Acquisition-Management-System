import api from './api';

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface AuditLogFilters {
  user_id?: string;
  module?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
}

// Map backend audit log to frontend AuditLog type
const mapFromBackend = (data: any): AuditLog => ({
  id: data.id,
  timestamp: data.created_at,
  user: data.user?.name || data.name || 'Unknown',
  action: data.action,
  module: data.module || '-',
  details: data.detail || '-',
  ipAddress: data.ip_address || '-',
});

export const getAuditLogs = async (
  filters?: AuditLogFilters,
): Promise<AuditLog[]> => {
  const response = await api.get('/api/audit-logs', { params: filters });
  const auditLogs = response.data.audit_logs || [];

  return auditLogs.map(mapFromBackend);
};

export const getAuditLog = async (id: number): Promise<AuditLog> => {
  const response = await api.get(`/api/audit-logs/${id}`);

  return mapFromBackend(response.data.audit_log);
};
