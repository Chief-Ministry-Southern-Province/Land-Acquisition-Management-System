<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\AuditLogService;
use App\Services\BackupService;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    /**
     * Get all current system settings.
     */
    public function index(Request $request)
    {
        return response()->json([
            'settings' => SystemSetting::getAll(),
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // General
            'system_name' => 'nullable|string|max:255',
            'org_name' => 'nullable|string|max:255',
            'language' => 'nullable|string|in:en,si,ta',
            'timezone' => 'nullable|string|max:100',
            'date_format' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:10',

            // Security
            'session_timeout' => 'nullable|numeric|min:5|max:1440',
            'max_login_attempts' => 'nullable|numeric|min:1|max:20',
            'password_min_length' => 'nullable|numeric|min:6|max:64',
            'two_factor' => 'nullable|boolean',
            'enforce_password_expiry' => 'nullable|boolean',
            'password_expiry_days' => 'nullable|numeric|min:15|max:365',
            'ip_whitelist' => 'nullable|boolean',

            // Notifications
            'email_notifs' => 'nullable|boolean',
            'system_notifs' => 'nullable|boolean',
            'approval_alerts' => 'nullable|boolean',
            'deadline_alerts' => 'nullable|boolean',
            'daily_digest' => 'nullable|boolean',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|numeric|min:1|max:65535',

            // Automated Backup & Retention
            'auto_backup' => 'nullable|boolean',
            'backup_frequency' => 'nullable|string|in:hourly,daily,weekly,monthly',
            'retention_days' => 'nullable|integer|min:7|max:365',
            'audit_log_retention' => 'nullable|integer|min:30|max:3650',
            'maintenance_mode' => 'nullable|boolean',
        ]);

        if (array_key_exists('smtp_port', $validated) && $validated['smtp_port'] !== null) {
            $validated['smtp_port'] = (string) $validated['smtp_port'];
        }

        $previousMaintenance = (bool) SystemSetting::get('maintenance_mode', false);

        SystemSetting::setMany($validated);

        if (array_key_exists('maintenance_mode', $validated)) {
            $newMaintenance = (bool) $validated['maintenance_mode'];
            if ($newMaintenance !== $previousMaintenance) {
                AuditLogService::log(
                    $request->user()->id,
                    $request->user()->name,
                    'Maintenance Mode',
                    'System Settings',
                    $newMaintenance
                        ? 'Activated system maintenance mode (non-admin users locked out)'
                        : 'Deactivated system maintenance mode (system open to all roles)'
                );
            }
        }

        // Log to audit logs
        AuditLogService::log(
            $request->user()->id,
            $request->user()->name,
            'Update',
            'System Settings',
            'Updated system configuration, automated backup, and data retention settings'
        );

        return response()->json([
            'message' => 'System settings updated successfully',
            'settings' => SystemSetting::getAll(),
        ]);
    }

    /**
     * Trigger manual retention cleanup for backups.
     */
    public function cleanBackups(Request $request)
    {
        $days = $request->input('days');
        $days = $days !== null ? (int) $days : null;

        $result = BackupService::cleanOldBackups($days);
        $deletedLogs = BackupService::cleanOldAuditLogs();

        AuditLogService::log(
            $request->user()->id,
            $request->user()->name,
            'Delete',
            'Backup & Maintenance',
            "Triggered manual backup retention cleanup: deleted {$result['deleted_count']} file(s)"
        );

        return response()->json([
            'message' => "Retention cleanup completed. Deleted {$result['deleted_count']} old backup(s).",
            'result' => $result,
            'deleted_audit_logs' => $deletedLogs,
        ]);
    }
}
