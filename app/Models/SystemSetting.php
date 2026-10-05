<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Default system settings matching the UI configuration.
     */
    public static function defaults(): array
    {
        return [
            // General
            'system_name' => 'Land Acquisition Management System',
            'org_name' => 'Chief Ministry – Southern Province',
            'language' => 'en',
            'timezone' => 'Asia/Colombo',
            'date_format' => 'DD/MM/YYYY',
            'currency' => 'LKR',

            // Security
            'session_timeout' => '30',
            'max_login_attempts' => '5',
            'password_min_length' => '8',
            'two_factor' => false,
            'enforce_password_expiry' => true,
            'password_expiry_days' => '90',
            'ip_whitelist' => false,

            // Notifications
            'email_notifs' => true,
            'system_notifs' => true,
            'approval_alerts' => true,
            'deadline_alerts' => true,
            'daily_digest' => false,
            'smtp_host' => 'smtp.lams.gov.lk',
            'smtp_port' => '587',

            // Automated Backup & Maintenance
            'auto_backup' => true,
            'backup_frequency' => 'daily', // hourly, daily, weekly, monthly
            'retention_days' => 30, // 7 to 365 days
            'audit_log_retention' => 365, // 30 to 3650 days
            'maintenance_mode' => false,
            'last_auto_backup_at' => null,
        ];
    }

    /**
     * Get a setting value with default fallback.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (! $setting) {
            return $default ?? (static::defaults()[$key] ?? null);
        }

        $defaultVal = static::defaults()[$key] ?? null;

        // Keep string settings as strings rather than json_decode turning "587" into int 587
        if (is_string($defaultVal) && ! in_array(strtolower((string) $setting->value), ['true', 'false', 'null'])) {
            return (string) $setting->value;
        }

        $decoded = json_decode($setting->value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        return $setting->value;
    }

    /**
     * Set a setting value.
     */
    public static function set(string $key, mixed $value): void
    {
        $storedValue = is_array($value) || is_bool($value) || is_object($value)
            ? json_encode($value)
            : (string) $value;

        static::updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue]
        );
    }

    /**
     * Set multiple settings at once.
     */
    public static function setMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            static::set($key, $value);
        }
    }

    /**
     * Get all settings merged with default values.
     */
    public static function getAll(): array
    {
        $allDefaults = static::defaults();
        $stored = static::all()->pluck('value', 'key')->toArray();

        $merged = [];
        foreach ($allDefaults as $key => $defaultVal) {
            if (array_key_exists($key, $stored)) {
                $val = $stored[$key];
                if (is_string($defaultVal) && ! in_array(strtolower((string) $val), ['true', 'false', 'null'])) {
                    $merged[$key] = (string) $val;
                } else {
                    $decoded = json_decode($val, true);
                    $merged[$key] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $val;
                }
            } else {
                $merged[$key] = $defaultVal;
            }
        }

        // Include any extra settings stored in DB
        foreach ($stored as $key => $val) {
            if (! array_key_exists($key, $merged)) {
                $decoded = json_decode($val, true);
                $merged[$key] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $val;
            }
        }

        return $merged;
    }
}
