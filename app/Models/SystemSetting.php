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
     * Read a key directly from .env file with fallback to runtime env/config.
     */
    public static function getEnvValue(string $key, mixed $default = null): mixed
    {
        $envPath = base_path('.env');
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (str_starts_with($line, '#')) {
                    continue;
                }
                if (preg_match('/^'.preg_quote($key, '/').'=(.*)$/', $line, $matches)) {
                    $val = trim($matches[1]);
                    if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                        (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                        $val = substr($val, 1, -1);
                    }

                    return $val;
                }
            }
        }

        return env($key, $default);
    }

    /**
     * Safely update or append key-value pairs in the .env file and runtime environment.
     */
    public static function updateEnv(array $pairs): void
    {
        $envPath = base_path('.env');
        if (! file_exists($envPath)) {
            return;
        }

        $content = file_get_contents($envPath);

        foreach ($pairs as $key => $value) {
            $key = trim($key);
            $valStr = (string) $value;
            $formatted = preg_match('/\s/', $valStr) ? '"'.addcslashes($valStr, '"').'"' : $valStr;

            $pattern = '/^('.preg_quote($key, '/').'=)(.*)$/m';

            if (preg_match($pattern, $content)) {
                $content = preg_replace($pattern, "{$key}={$formatted}", $content, 1);
            } else {
                $content = rtrim($content)."\n{$key}={$formatted}\n";
            }

            putenv("{$key}={$valStr}");
            $_ENV[$key] = $valStr;
            $_SERVER[$key] = $valStr;
        }

        file_put_contents($envPath, $content);
    }

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
            'timezone' => config('app.timezone', 'Asia/Colombo'),
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
            'sms_notifs' => true,
            'system_notifs' => true,
            'approval_alerts' => true,
            'deadline_alerts' => true,
            'daily_digest' => false,
            'smtp_host' => static::getEnvValue('MAIL_HOST', env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1'))),
            'smtp_port' => (string) static::getEnvValue('MAIL_PORT', env('MAIL_PORT', config('mail.mailers.smtp.port', '587'))),

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
        if ($key === 'smtp_host') {
            return static::getEnvValue('MAIL_HOST', env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1')));
        }

        if ($key === 'smtp_port') {
            return (string) static::getEnvValue('MAIL_PORT', env('MAIL_PORT', config('mail.mailers.smtp.port', '587')));
        }

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
        if ($key === 'smtp_host' && $value !== null) {
            static::updateEnv(['MAIL_HOST' => (string) $value]);
            config(['mail.mailers.smtp.host' => (string) $value]);
        } elseif ($key === 'smtp_port' && $value !== null) {
            static::updateEnv(['MAIL_PORT' => (string) $value]);
            config(['mail.mailers.smtp.port' => (int) $value]);
        }

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
        $envPairs = [];
        if (array_key_exists('smtp_host', $settings) && $settings['smtp_host'] !== null) {
            $envPairs['MAIL_HOST'] = (string) $settings['smtp_host'];
            config(['mail.mailers.smtp.host' => (string) $settings['smtp_host']]);
        }
        if (array_key_exists('smtp_port', $settings) && $settings['smtp_port'] !== null) {
            $envPairs['MAIL_PORT'] = (string) $settings['smtp_port'];
            config(['mail.mailers.smtp.port' => (int) $settings['smtp_port']]);
        }

        if (! empty($envPairs)) {
            static::updateEnv($envPairs);
        }

        foreach ($settings as $key => $value) {
            $storedValue = is_array($value) || is_bool($value) || is_object($value)
                ? json_encode($value)
                : (string) $value;

            static::updateOrCreate(
                ['key' => $key],
                ['value' => $storedValue]
            );
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

        // Always ensure smtp_host and smtp_port reflect current .env configuration
        $merged['smtp_host'] = static::getEnvValue('MAIL_HOST', env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1')));
        $merged['smtp_port'] = (string) static::getEnvValue('MAIL_PORT', env('MAIL_PORT', config('mail.mailers.smtp.port', '587')));

        return $merged;
    }
}
