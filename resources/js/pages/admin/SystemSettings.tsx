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
  Monitor,
  RefreshCcw,
  Save,
  Server,
  Settings,
  Shield,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

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
      {hint && (
        <span className="text-muted-foreground text-xs">{hint}</span>
      )}
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
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
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
    <div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
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
          <p className="text-muted-foreground mt-0.5 text-sm">
            {description}
          </p>
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
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);

  // ── General settings ──
  const [systemName, setSystemName] = useState('Land Acquisition Management System');
  const [orgName, setOrgName] = useState('Chief Ministry – Southern Province');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Colombo');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('LKR');
  const [darkMode, setDarkMode] = useState(false);

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>System Settings</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Configure system-wide preferences, security, and maintenance options
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
        >
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4" /> Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Changes
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
              System Status
            </p>
            <p className="text-secondary text-sm font-semibold">
              Operational
            </p>
          </div>
        </div>
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="bg-secondary/10 rounded-xl p-3">
            <HardDrive className="text-secondary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Last Backup
            </p>
            <p className="text-sm font-semibold">Today, 02:00 AM</p>
          </div>
        </div>
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="rounded-xl bg-cyan-100 p-3">
            <Clock className="h-5 w-5 text-cyan-700" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Uptime
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════ General ═══════ */}
      {activeTab === 'general' && (
        <div className="space-y-5">
          <SectionCard
            title="Application"
            description="Basic application identity and regional preferences"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label="System Name"
                hint="Displayed in the header and browser tab"
              >
                <input
                  className={inputCls}
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </Field>
              <Field
                label="Organisation Name"
                hint="Official organisation administering the system"
              >
                <input
                  className={inputCls}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </Field>
              <Field label="Default Language">
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
              <Field label="Timezone">
                <select
                  className={inputCls}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Asia/Colombo">Asia/Colombo (UTC +5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </Field>
              <Field label="Date Format">
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
              <Field label="Currency">
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

          <SectionCard
            title="Display"
            description="Appearance and interface preferences"
          >
            <SettingRow
              icon={Monitor}
              title="Dark Mode"
              description="Enable dark mode for the entire application interface"
            >
              <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </SettingRow>
          </SectionCard>
        </div>
      )}

      {/* ═══════ Security ═══════ */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <SectionCard
            title="Authentication"
            description="Session and login policies"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label="Session Timeout (minutes)"
                hint="Auto-logout after inactivity"
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
                label="Max Login Attempts"
                hint="Account locks after failed attempts"
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
              title="Two-Factor Authentication"
              description="Require OTP verification during login for all users"
            >
              <Toggle
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
              />
            </SettingRow>
            <SettingRow
              icon={Lock}
              title="IP Whitelist"
              description="Restrict access to pre-approved IP addresses only"
            >
              <Toggle
                checked={ipWhitelist}
                onChange={() => setIpWhitelist(!ipWhitelist)}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            title="Password Policy"
            description="Define password strength and expiry rules"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label="Minimum Password Length"
                hint="Recommended: 8 or more characters"
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
                label="Password Expiry (days)"
                hint="Users must change password after this period"
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
              title="Enforce Password Expiry"
              description="Force users to change their password periodically"
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
            title="Notification Channels"
            description="Toggle notification delivery methods"
          >
            <SettingRow
              icon={Mail}
              title="Email Notifications"
              description="Send notifications via email for important events"
            >
              <Toggle
                checked={emailNotifs}
                onChange={() => setEmailNotifs(!emailNotifs)}
              />
            </SettingRow>
            <SettingRow
              icon={Bell}
              title="In-App Notifications"
              description="Show real-time notifications within the system"
            >
              <Toggle
                checked={systemNotifs}
                onChange={() => setSystemNotifs(!systemNotifs)}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            title="Alert Types"
            description="Choose which events trigger alerts"
          >
            <SettingRow
              icon={CheckCircle}
              title="Approval Alerts"
              description="Notify when items require approval or are approved/rejected"
            >
              <Toggle
                checked={approvalAlerts}
                onChange={() => setApprovalAlerts(!approvalAlerts)}
              />
            </SettingRow>
            <SettingRow
              icon={Clock}
              title="Deadline Alerts"
              description="Alert users when deadlines are approaching or overdue"
            >
              <Toggle
                checked={deadlineAlerts}
                onChange={() => setDeadlineAlerts(!deadlineAlerts)}
              />
            </SettingRow>
            <SettingRow
              icon={Mail}
              title="Daily Digest"
              description="Send a daily summary email of all system activity"
            >
              <Toggle
                checked={dailyDigest}
                onChange={() => setDailyDigest(!dailyDigest)}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            title="Email Server (SMTP)"
            description="Configure the outgoing mail server"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field label="SMTP Host" hint="e.g. smtp.lams.gov.lk">
                <input
                  className={inputCls}
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </Field>
              <Field label="SMTP Port" hint="Common ports: 25, 465, 587">
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
            title="Automated Backup"
            description="Schedule and configure database backups"
          >
            <SettingRow
              icon={Database}
              title="Automatic Backups"
              description="Run scheduled backups of the entire database"
            >
              <Toggle
                checked={autoBackup}
                onChange={() => setAutoBackup(!autoBackup)}
              />
            </SettingRow>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field label="Backup Frequency">
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
                label="Retention Period (days)"
                hint="Number of days to keep old backups"
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
            title="Manual Actions"
            description="One-time maintenance operations"
          >
            <div className="flex flex-wrap gap-3 py-5">
              <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors">
                <Upload className="h-4 w-4" /> Backup Now
              </button>
              <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors">
                <RefreshCcw className="h-4 w-4" /> Clear Cache
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="Data Retention"
            description="Configure how long historical data is kept"
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 py-5 sm:grid-cols-2">
              <Field
                label="Audit Log Retention (days)"
                hint="Logs older than this are automatically purged"
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
            title="Maintenance Mode"
            description="Take the system offline for maintenance"
          >
            <SettingRow
              icon={Globe}
              title="Enable Maintenance Mode"
              description="Users will see a maintenance page and cannot access the system"
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
                  Maintenance mode is active. All non-admin users are currently
                  locked out.
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
