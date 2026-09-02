import {
  Bell,
  CheckCircle,
  Clock,
  Database,
  Globe,
  HardDrive,
  Info,
  Lock,
  Mail,
  RefreshCcw,
  Save,
  Server,
  Settings,
  Shield,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmDialog } from '@/lib/alerts';
import {
  getBackups,
  createBackup,
  createFilesBackup,
  downloadBackup,
  deleteBackup,
  clearCache,
  restoreBackup,
} from '@/services/backupService';
import type { BackupFile } from '@/services/backupService';

/* ────────────────── Types ────────────────── */

type Tab = 'general' | 'security' | 'notifications' | 'backup';

/* ────────────────── Shared helpers ────────────────── */

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`focus:ring-primary/40 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-6 first:pt-3 last:pb-3">
      <div className="flex items-start gap-3">
        <div className="bg-muted mt-0.5 rounded-lg p-2">
          <Icon className="text-muted-foreground h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border">
      <div className="border-border border-b px-6 py-4">
        <h3>{title}</h3>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        )}
      </div>
      <div className="divide-border divide-y px-6">{children}</div>
    </div>
  );
}

/* ────────────────── Tab definitions ────────────────── */

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'backup', label: 'Backup & Maintenance', icon: Database },
];

/* ────────────────── Main component ────────────────── */

export default function SystemSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);

  // ── General settings ──
  const [systemName, setSystemName] = useState(
    'Land Acquisition Management System',
  );
  const [orgName, setOrgName] = useState('Chief Ministry – Southern Province');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Colombo');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('LKR');

  // ── Security settings ──
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [twoFactor, setTwoFactor] = useState(false);
  const [enforcePasswordExpiry, setEnforcePasswordExpiry] = useState(true);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState('90');
  const [ipWhitelist, setIpWhitelist] = useState(false);

  // ── Notification settings ──
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [systemNotifs, setSystemNotifs] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.lams.gov.lk');
  const [smtpPort, setSmtpPort] = useState('587');

  // ── Backup settings ──
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [auditLogRetention, setAuditLogRetention] = useState('365');

  // ── Backup API states ──
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [creatingFilesBackup, setCreatingFilesBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const loadBackups = useCallback(async () => {
    setLoadingBackups(true);

    try {
      const data = await getBackups();

      setBackups(data);
    } catch (error) {
      console.error('Failed to load backups:', error);
      showToast(
        'error',
        t(
          'toast_failed_load_backups',
          'Failed to load database and file backups list.',
        ),
      );
    } finally {
      setLoadingBackups(false);
    }
  }, [t]);

  useEffect(() => {
    if (activeTab === 'backup') {
      Promise.resolve().then(() => {
        loadBackups();
      });
    }
  }, [activeTab, loadBackups]);

  const handleBackupNow = async () => {
    if (creatingBackup) {
      return;
    }

    setCreatingBackup(true);

    try {
      await createBackup();
      showToast(
        'success',
        t('toast_db_backup_success', 'Database backup created successfully.'),
      );
      loadBackups();
    } catch (error) {
      console.error('Failed to create backup:', error);
      showToast(
        'error',
        t('toast_failed_db_backup', 'Failed to create database backup.'),
      );
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleBackupFiles = async () => {
    if (creatingFilesBackup) {
      return;
    }

    setCreatingFilesBackup(true);

    try {
      await createFilesBackup();
      showToast(
        'success',
        t(
          'toast_files_backup_success',
          'Uploaded files backup created successfully.',
        ),
      );
      loadBackups();
    } catch (error) {
      console.error('Failed to create files backup:', error);
      showToast(
        'error',
        t(
          'toast_failed_files_backup',
          'Failed to create uploaded files backup.',
        ),
      );
    } finally {
      setCreatingFilesBackup(false);
    }
  };

  const handleClearCache = async () => {
    if (clearingCache) {
      return;
    }

    setClearingCache(true);

    try {
      await clearCache();
      showToast(
        'success',
        t('toast_cache_cleared', 'System cache cleared successfully.'),
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
      showToast(
        'error',
        t('toast_failed_clear_cache', 'Failed to clear system cache.'),
      );
    } finally {
      setClearingCache(false);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      showToast(
        'success',
        t(
          'toast_downloading_backup',
          'Downloading database backup: :name',
        ).replace(':name', filename),
      );
      await downloadBackup(filename);
    } catch (error) {
      console.error('Failed to download backup:', error);
      showToast(
        'error',
        t(
          'toast_failed_download_backup',
          'Failed to download database backup.',
        ),
      );
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    const confirmed = await confirmDialog({
      title: t('delete_backup_file', 'Delete Backup File'),
      text: t(
        'confirm_delete_backup_desc',
        'Are you sure you want to delete the backup file ":name"?',
      ).replace(':name', filename),
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteBackup(filename);
      showToast(
        'success',
        t('toast_backup_deleted', 'Backup file deleted successfully.'),
      );
      loadBackups();
    } catch (error) {
      console.error('Failed to delete backup:', error);
      showToast(
        'error',
        t('toast_failed_delete_backup', 'Failed to delete backup file.'),
      );
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    const confirmed = await confirmDialog({
      title: t('restore_database', 'Restore Database'),
      text: t(
        'confirm_restore_backup_desc',
        'Are you sure you want to restore the database backup from ":name"? This will overwrite all current system data.',
      ).replace(':name', filename),
      confirmButtonText: t('restore', 'Restore'),
    });

    if (!confirmed) {
      return;
    }

    setRestoringBackup(filename);

    try {
      await restoreBackup(filename);
      showToast(
        'success',
        t('toast_db_restored', 'Database restored successfully.'),
      );
      loadBackups();
    } catch (error: any) {
      console.error('Failed to restore backup:', error);
      showToast(
        'error',
        error.response?.data?.message ||
          t('toast_failed_restore_db', 'Failed to restore database backup.'),
      );
    } finally {
      setRestoringBackup(null);
    }
  };

  const lastBackupTime =
    backups.length > 0
      ? new Date(backups[0].created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : 'None';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="relative space-y-6">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'border-[#2E7D32]/30 bg-[#2E7D32]/10 text-[#2E7D32]'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>{t('sys_settings_title', 'System Settings')}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {t(
              'sys_settings_subtitle',
              'Configure system-wide preferences, security, and maintenance options',
            )}
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
        >
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4" /> {t('saved', 'Saved')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {t('save_changes', 'Save Changes')}
            </>
          )}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="bg-primary/10 rounded-xl p-3">
            <Server className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {t('sys_status', 'System Status')}
            </p>
            <p className="text-secondary text-sm font-semibold">
              {t('operational', 'Operational')}
            </p>
          </div>
        </div>
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="bg-secondary/10 rounded-xl p-3">
            <HardDrive className="text-secondary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {t('last_backup', 'Last Backup')}
            </p>
            <p className="text-sm font-semibold">{lastBackupTime}</p>
          </div>
        </div>
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="rounded-xl bg-cyan-100 p-3">
            <Clock className="h-5 w-5 text-cyan-700" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              {t('uptime', 'Uptime')}
            </p>
            <p className="text-sm font-semibold">99.97%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t('tab_' + tab.key, tab.label)}
            </button>
          );
        })}
      </div>

      {/* ═══════ General ═══════ */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <SectionCard
            title={t('sec_application', 'Application')}
            description={t(
              'sec_application_subtitle',
              'Basic application identity and regional preferences',
            )}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label={t('system_name', 'System Name')}
                hint={t(
                  'system_name_hint',
                  'Displayed in the header and browser tab',
                )}
              >
                <input
                  className={inputCls}
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </Field>
              <Field
                label={t('organisation_name', 'Organisation Name')}
                hint={t(
                  'organisation_name_hint',
                  'Official organisation administering the system',
                )}
              >
                <input
                  className={inputCls}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </Field>
              <Field label={t('default_language', 'Default Language')}>
                <select
                  className={inputCls}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </Field>
              <Field label={t('timezone', 'Timezone')}>
                <select
                  className={inputCls}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Asia/Colombo">Asia/Colombo (UTC +5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </Field>
              <Field label={t('date_format', 'Date Format')}>
                <select
                  className={inputCls}
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </Field>
              <Field label={t('currency', 'Currency')}>
                <select
                  className={inputCls}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="LKR">LKR – Sri Lankan Rupee</option>
                  <option value="USD">USD – US Dollar</option>
                </select>
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ═══════ Security ═══════ */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <SectionCard
            title={t('sec_authentication', 'Authentication')}
            description={t(
              'sec_authentication_subtitle',
              'Session and login policies',
            )}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label={t('session_timeout', 'Session Timeout (minutes)')}
                hint={t('session_timeout_hint', 'Auto-logout after inactivity')}
              >
                <input
                  className={inputCls}
                  type="number"
                  min="5"
                  max="1440"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
              </Field>
              <Field
                label={t('max_login_attempts', 'Max Login Attempts')}
                hint={t(
                  'max_login_attempts_hint',
                  'Account locks after failed attempts',
                )}
              >
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  max="20"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                />
              </Field>
            </div>
            <SettingRow
              icon={Shield}
              title={t('two_factor_auth', 'Two-Factor Authentication')}
              description={t(
                'two_factor_auth_desc',
                'Require OTP verification during login for all users',
              )}
            >
              <Toggle
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
              />
            </SettingRow>
            <SettingRow
              icon={Lock}
              title={t('ip_whitelist', 'IP Whitelist')}
              description={t(
                'ip_whitelist_desc',
                'Restrict access to pre-approved IP addresses only',
              )}
            >
              <Toggle
                checked={ipWhitelist}
                onChange={() => setIpWhitelist(!ipWhitelist)}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            title={t('sec_password_policy', 'Password Policy')}
            description={t(
              'sec_password_policy_subtitle',
              'Define password strength and expiry rules',
            )}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label={t('min_password_length', 'Minimum Password Length')}
                hint={t(
                  'min_password_length_hint',
                  'Recommended: 8 or more characters',
                )}
              >
                <input
                  className={inputCls}
                  type="number"
                  min="6"
                  max="32"
                  value={passwordMinLength}
                  onChange={(e) => setPasswordMinLength(e.target.value)}
                />
              </Field>
              <Field
                label={t('password_expiry', 'Password Expiry (days)')}
                hint={t(
                  'password_expiry_hint',
                  'Users must change password after this period',
                )}
              >
                <input
                  className={inputCls}
                  type="number"
                  min="30"
                  max="365"
                  value={passwordExpiryDays}
                  onChange={(e) => setPasswordExpiryDays(e.target.value)}
                  disabled={!enforcePasswordExpiry}
                />
              </Field>
            </div>
            <SettingRow
              icon={RefreshCcw}
              title={t('enforce_password_expiry', 'Enforce Password Expiry')}
              description={t(
                'enforce_password_expiry_desc',
                'Force users to change their password periodically',
              )}
            >
              <Toggle
                checked={enforcePasswordExpiry}
                onChange={() =>
                  setEnforcePasswordExpiry(!enforcePasswordExpiry)
                }
              />
            </SettingRow>
          </SectionCard>
        </div>
      )}

      {/* ═══════ Notifications ═══════ */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <SectionCard
            title={t('sec_notification_channels', 'Notification Channels')}
            description={t(
              'sec_notification_channels_subtitle',
              'Toggle notification delivery methods',
            )}
          >
            <SettingRow
              icon={Mail}
              title={t('email_notifications', 'Email Notifications')}
              description={t(
                'email_notifications_desc',
                'Send notifications via email for important events',
              )}
            >
              <Toggle
                checked={emailNotifs}
                onChange={() => setEmailNotifs(!emailNotifs)}
              />
            </SettingRow>
            <SettingRow
              icon={Bell}
              title={t('in_app_notifications', 'In-App Notifications')}
              description={t(
                'in_app_notifications_desc',
                'Show real-time notifications within the system',
              )}
            >
              <Toggle
                checked={systemNotifs}
                onChange={() => setSystemNotifs(!systemNotifs)}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            title={t('sec_alert_types', 'Alert Types')}
            description={t(
              'sec_alert_types_subtitle',
              'Choose which events trigger alerts',
            )}
          >
            <SettingRow
              icon={CheckCircle}
              title={t('approval_alerts', 'Approval Alerts')}
              description={t(
                'approval_alerts_desc',
                'Notify when items require approval or are approved/rejected',
              )}
            >
              <Toggle
                checked={approvalAlerts}
                onChange={() => setApprovalAlerts(!approvalAlerts)}
              />
            </SettingRow>
            <SettingRow
              icon={Clock}
              title={t('deadline_alerts', 'Deadline Alerts')}
              description={t(
                'deadline_alerts_desc',
                'Alert users when deadlines are approaching or overdue',
              )}
            >
              <Toggle
                checked={deadlineAlerts}
                onChange={() => setDeadlineAlerts(!deadlineAlerts)}
              />
            </SettingRow>
            <SettingRow
              icon={Mail}
              title={t('daily_digest', 'Daily Digest')}
              description={t(
                'daily_digest_desc',
                'Send a daily summary email of all system activity',
              )}
            >
              <Toggle
                checked={dailyDigest}
                onChange={() => setDailyDigest(!dailyDigest)}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            title={t('sec_email_server', 'Email Server (SMTP)')}
            description={t(
              'sec_email_server_subtitle',
              'Configure the outgoing mail server',
            )}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label={t('smtp_host', 'SMTP Host')}
                hint="e.g. smtp.lams.gov.lk"
              >
                <input
                  className={inputCls}
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </Field>
              <Field
                label={t('smtp_port', 'SMTP Port')}
                hint="Common ports: 25, 465, 587"
              >
                <input
                  className={inputCls}
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ═══════ Backup & Maintenance ═══════ */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          <SectionCard
            title={t('sec_automated_backup', 'Automated Backup')}
            description={t(
              'sec_automated_backup_subtitle',
              'Schedule and configure database backups',
            )}
          >
            <SettingRow
              icon={Database}
              title={t('automatic_backups', 'Automatic Backups')}
              description={t(
                'automatic_backups_desc',
                'Run scheduled backups of the entire database',
              )}
            >
              <Toggle
                checked={autoBackup}
                onChange={() => setAutoBackup(!autoBackup)}
              />
            </SettingRow>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field label={t('backup_frequency', 'Backup Frequency')}>
                <select
                  className={inputCls}
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  disabled={!autoBackup}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </Field>
              <Field
                label={t('retention_period', 'Retention Period (days)')}
                hint={t(
                  'retention_period_hint',
                  'Number of days to keep old backups',
                )}
              >
                <input
                  className={inputCls}
                  type="number"
                  min="7"
                  max="365"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  disabled={!autoBackup}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title={t('sec_manual_actions', 'Manual Actions')}
            description={t(
              'sec_manual_actions_subtitle',
              'One-time maintenance operations',
            )}
          >
            <div className="flex flex-wrap gap-3 py-5">
              <button
                onClick={handleBackupNow}
                disabled={creatingBackup || creatingFilesBackup}
                className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
              >
                {creatingBackup ? (
                  <>
                    <LoadingSpinner type="beat" variant="primary" size="xs" />{' '}
                    {t('backing_up', 'Backing up...')}
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />{' '}
                    {t('backup_database', 'Backup Database')}
                  </>
                )}
              </button>
              <button
                onClick={handleBackupFiles}
                disabled={creatingBackup || creatingFilesBackup}
                className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
              >
                {creatingFilesBackup ? (
                  <>
                    <LoadingSpinner type="beat" variant="primary" size="xs" />{' '}
                    {t('backing_up', 'Backing up...')}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />{' '}
                    {t('backup_uploads', 'Backup Uploads')}
                  </>
                )}
              </button>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
              >
                {clearingCache ? (
                  <>
                    <LoadingSpinner type="beat" variant="primary" size="xs" />{' '}
                    {t('clearing_cache', 'Clearing Cache...')}
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />{' '}
                    {t('clear_cache', 'Clear Cache')}
                  </>
                )}
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title={t('sec_backup_history', 'Backup History')}
            description={t(
              'sec_backup_history_subtitle',
              'Download or delete previous manual database and uploaded file backups',
            )}
          >
            <div className="py-4">
              {loadingBackups ? (
                <div className="flex items-center justify-center py-6">
                  <LoadingSpinner type="sync" variant="secondary" size="md" />
                </div>
              ) : backups.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                  <Database className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm font-medium">
                    {t(
                      'no_backups_found',
                      'No database or file backups found.',
                    )}
                  </p>
                  <p className="mt-1 text-xs">
                    {t(
                      'no_backups_hint',
                      'Click "Backup Database" or "Backup Uploads" to create your first system backup.',
                    )}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-border text-muted-foreground border-b text-xs uppercase tracking-wider">
                        <th className="pb-3 font-semibold">
                          {t('col_file_name', 'File Name')}
                        </th>
                        <th className="pb-3 font-semibold">
                          {t('col_type', 'Type')}
                        </th>
                        <th className="pb-3 font-semibold">
                          {t('col_created_at', 'Created At')}
                        </th>
                        <th className="pb-3 font-semibold">
                          {t('col_file_size', 'File Size')}
                        </th>
                        <th className="pb-3 text-right font-semibold">
                          {t('col_actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {backups.map((bk) => {
                        const isFilesBackup =
                          bk.filename.startsWith('backup_files_');

                        return (
                          <tr key={bk.filename} className="hover:bg-muted/30">
                            <td className="max-w-[250px] truncate py-3.5 font-medium">
                              {bk.filename}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  isFilesBackup
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}
                              >
                                {isFilesBackup
                                  ? t('uploaded_files', 'Uploaded Files')
                                  : t('database', 'Database')}
                              </span>
                            </td>
                            <td className="text-muted-foreground py-3.5">
                              {new Date(
                                bk.created_at.replace(' ', 'T'),
                              ).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </td>
                            <td className="text-muted-foreground py-3.5">
                              {bk.size}
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleDownloadBackup(bk.filename)
                                  }
                                  title={t(
                                    'download_backup',
                                    'Download Backup',
                                  )}
                                  className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                {!isFilesBackup && (
                                  <button
                                    onClick={() =>
                                      handleRestoreBackup(bk.filename)
                                    }
                                    disabled={restoringBackup !== null}
                                    title={t(
                                      'restore_backup',
                                      'Restore Backup',
                                    )}
                                    className="text-muted-foreground hover:text-primary rounded p-1 transition-colors disabled:opacity-50"
                                  >
                                    {restoringBackup === bk.filename ? (
                                      <LoadingSpinner
                                        type="clip"
                                        variant="primary"
                                        size="xs"
                                      />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteBackup(bk.filename)
                                  }
                                  title={t('delete_backup', 'Delete Backup')}
                                  className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title={t('sec_data_retention', 'Data Retention')}
            description={t(
              'sec_data_retention_subtitle',
              'Configure how long historical data is kept',
            )}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label={t('audit_log_retention', 'Audit Log Retention (days)')}
                hint={t(
                  'audit_log_retention_hint',
                  'Logs older than this are automatically purged',
                )}
              >
                <input
                  className={inputCls}
                  type="number"
                  min="30"
                  max="3650"
                  value={auditLogRetention}
                  onChange={(e) => setAuditLogRetention(e.target.value)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title={t('sec_maintenance_mode', 'Maintenance Mode')}
            description={t(
              'sec_maintenance_mode_subtitle',
              'Take the system offline for maintenance',
            )}
          >
            <SettingRow
              icon={Globe}
              title={t('enable_maintenance_mode', 'Enable Maintenance Mode')}
              description={t(
                'enable_maintenance_mode_desc',
                'Users will see a maintenance page and cannot access the system',
              )}
            >
              <Toggle
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
            </SettingRow>
            {maintenanceMode && (
              <div className="py-3">
                <div className="bg-destructive/5 border-destructive/20 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
                  <Info className="h-3.5 w-3.5 flex-shrink-0" />
                  {t(
                    'maintenance_mode_active_desc',
                    'Maintenance mode is active. All non-admin users are currently locked out.',
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

SystemSettings.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
