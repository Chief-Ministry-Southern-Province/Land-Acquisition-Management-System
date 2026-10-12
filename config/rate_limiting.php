<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Master Switch
    |--------------------------------------------------------------------------
    |
    | Enables or disables the rate limiting system. When disabled, requests
    | are passed through without rate limit enforcement.
    |
    */
    'enabled' => env('RATE_LIMITING_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Temporary Block Duration (in minutes)
    |--------------------------------------------------------------------------
    |
    | The duration for which a user or IP address is temporarily blocked after
    | exceeding an operation or general rate limit threshold.
    |
    */
    'block_duration_minutes' => (int) env('RATE_LIMIT_BLOCK_DURATION_MINUTES', 15),

    /*
    |--------------------------------------------------------------------------
    | Administrator Alert Cooldown (in minutes)
    |--------------------------------------------------------------------------
    |
    | Minimum time between security alert notifications to administrators for
    | the same blocked subject, preventing alert flooding.
    |
    */
    'alert_cooldown_minutes' => (int) env('RATE_LIMIT_ALERT_COOLDOWN_MINUTES', 15),

    /*
    |--------------------------------------------------------------------------
    | Operation Limits
    |--------------------------------------------------------------------------
    |
    | Configured thresholds for each operation tier:
    |   - per_minute: Burst protection limit per minute
    |   - per_hour: Sustained excessive usage limit per hour
    |
    */
    'operations' => [
        'general' => [
            'name' => 'General system operations',
            'per_minute' => (int) env('RATE_LIMIT_GENERAL_PER_MINUTE', 120),
            'per_hour' => (int) env('RATE_LIMIT_GENERAL_PER_HOUR', 2000),
        ],
        'search_filter' => [
            'name' => 'Search and filtering',
            'per_minute' => (int) env('RATE_LIMIT_SEARCH_PER_MINUTE', 60),
            'per_hour' => (int) env('RATE_LIMIT_SEARCH_PER_HOUR', 1000),
        ],
        'cud_records' => [
            'name' => 'Create, update, and delete records',
            'per_minute' => (int) env('RATE_LIMIT_CUD_PER_MINUTE', 30),
            'per_hour' => (int) env('RATE_LIMIT_CUD_PER_HOUR', 500),
        ],
        'document_upload_import' => [
            'name' => 'Document uploads and imports',
            'per_minute' => (int) env('RATE_LIMIT_UPLOAD_PER_MINUTE', 10),
            'per_hour' => (int) env('RATE_LIMIT_UPLOAD_PER_HOUR', 100),
        ],
        'report_export' => [
            'name' => 'Report generation and exports',
            'per_minute' => (int) env('RATE_LIMIT_REPORT_PER_MINUTE', 5),
            'per_hour' => (int) env('RATE_LIMIT_REPORT_PER_HOUR', 30),
        ],
        'auth_login' => [
            'name' => 'Login attempts',
            'per_minute' => (int) env('RATE_LIMIT_LOGIN_PER_MINUTE', 5),
            'per_hour' => (int) env('RATE_LIMIT_LOGIN_PER_HOUR', 20),
        ],
        'auth_password_reset' => [
            'name' => 'Password reset requests',
            'per_minute' => (int) env('RATE_LIMIT_RESET_PER_MINUTE', 3),
            'per_hour' => (int) env('RATE_LIMIT_RESET_PER_HOUR', 5),
        ],
    ],
];
