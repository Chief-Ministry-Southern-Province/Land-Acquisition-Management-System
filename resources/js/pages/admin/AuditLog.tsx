import { Calendar, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuditLogsQuery } from '@/hooks/queries/useAuditLogsQuery';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { DataTable } from '../../components/ui/DataTable';

export default function AuditLog() {
  const { t } = useTranslation();

  // Filter state
  const [userFilter, setUserFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filters = useMemo(
    () => ({
      user_id: userFilter || undefined,
      module: moduleFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [userFilter, moduleFilter, dateFrom, dateTo],
  );

  const {
    data: auditLogs = [],
    isLoading: loading,
    isError,
    refetch,
  } = useAuditLogsQuery(filters);

  const error = isError
    ? t(
        'toast_failed_load_audit_logs',
        'Failed to load audit logs. Please try again.',
      )
    : null;

  // Get unique users and modules for filter dropdowns
  const uniqueUsers = useMemo(
    () => [...new Set(auditLogs.map((log) => log.user))],
    [auditLogs],
  );
  const uniqueModules = useMemo(
    () => [...new Set(auditLogs.map((log) => log.module))],
    [auditLogs],
  );

  const columns = [
    {
      key: 'timestamp',
      label: t('col_datetime', 'Date & Time'),
      sortable: true,
    },
    { key: 'user', label: t('user', 'User'), sortable: true },
    { key: 'action', label: t('col_action', 'Action'), sortable: true },
    { key: 'module', label: t('module', 'Module'), sortable: true },
    { key: 'details', label: t('col_details', 'Details'), sortable: true },
    {
      key: 'ipAddress',
      label: t('col_ip_address', 'IP Address'),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>{t('audit_trail_title', 'Audit Trail')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('audit_trail_subtitle', 'System activity and change history')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t('filter_logs', 'Filter Logs')}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm">{t('user', 'User')}</label>
            <select
              title="Select User"
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">{t('all_users', 'All Users')}</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              {t('module', 'Module')}
            </label>
            <select
              title="Select Module"
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">{t('all_modules', 'All Modules')}</option>
              {uniqueModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              {t('date_from', 'Date From')}
            </label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="date"
                className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              {t('date_to', 'Date To')}
            </label>
            <div className="relative">
              <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="date"
                className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-4 text-sm">
          {error}
          <button
            className="ml-2 underline hover:no-underline"
            onClick={() => refetch()}
          >
            {t('retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Audit Logs Table */}
      <DataTable
        columns={columns}
        data={auditLogs}
        loading={loading}
        loadingMessage={t('loading_audit_logs', 'Loading audit logs...')}
      />
    </div>
  );
}

AuditLog.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
