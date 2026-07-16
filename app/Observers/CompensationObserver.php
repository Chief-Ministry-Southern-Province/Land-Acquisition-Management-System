<?php

namespace App\Observers;

use App\Models\Compensation;
use App\Services\AuditLogService;

class CompensationObserver
{
    /**
     * Handle the Compensation "created" event.
     */
    public function created(Compensation $compensation): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Compensation', "Created compensation {$compensation->compensation_id}");
        }
    }

    /**
     * Handle the Compensation "updated" event.
     */
    public function updated(Compensation $compensation): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Compensation', "Updated compensation {$compensation->compensation_id}");
        }
    }

    /**
     * Handle the Compensation "deleted" event.
     */
    public function deleted(Compensation $compensation): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Compensation', "Deleted compensation {$compensation->compensation_id}");
        }
    }
}
