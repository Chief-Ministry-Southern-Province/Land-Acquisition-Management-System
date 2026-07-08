<?php

namespace App\Services;

use App\Models\AuditLogs;

class AuditLogService
{
    public static function log(
        int $userId,
        string $name,
        string $action,
        ?string $module = null,
        ?string $detail = null,
    ): void {
        AuditLogs::create([
            'user_id' => $userId,
            'name' => $name,
            'action' => $action,
            'module' => $module ?? 'General',
            'detail' => $detail ?? $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
