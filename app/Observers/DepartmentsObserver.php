<?php

namespace App\Observers;

use App\Models\Departments;
use App\Services\AuditLogService;

class DepartmentsObserver
{
    /**
     * Handle the Departments "created" event.
     */
    public function created(Departments $departments): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Departments', "Created department {$departments->department_name}");
        }
    }

    /**
     * Handle the Departments "updated" event.
     */
    public function updated(Departments $departments): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Departments', "Updated department {$departments->department_name}");
        }
    }

    /**
     * Handle the Departments "deleted" event.
     */
    public function deleted(Departments $departments): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Departments', "Deleted department {$departments->department_name}");
        }
    }

    /**
     * Handle the Departments "restored" event.
     */
    public function restored(Departments $departments): void
    {
        //
    }

    /**
     * Handle the Departments "force deleted" event.
     */
    public function forceDeleted(Departments $departments): void
    {
        //
    }
}
