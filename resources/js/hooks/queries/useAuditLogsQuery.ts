import { useQuery } from '@tanstack/react-query';
import type { AuditLogFilters, AuditLog } from '@/services/auditLogService';
import { getAuditLogs } from '@/services/auditLogService';

export const AUDIT_LOGS_QUERY_KEY = 'audit-logs';

export function useAuditLogsQuery(
  filters?: AuditLogFilters,
  initialData?: AuditLog[],
) {
  return useQuery({
    queryKey: [AUDIT_LOGS_QUERY_KEY, filters],
    queryFn: () => getAuditLogs(filters),
    initialData,
  });
}
