<?php

namespace App\Observers;

use App\Models\Roles;
use App\Services\AuditLogService;

class RoleObserver
{
    /**
     * Handle the Roles "created" event.
     */
    public function created(Roles $role): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Roles', "Created role {$role->role_name}");
        }
    }

    /**
     * Handle the Roles "updated" event.
     */
    public function updated(Roles $role): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Roles', "Updated role {$role->role_name}");
        }
    }

    /**
     * Handle the Roles "deleted" event.
     */
    public function deleted(Roles $role): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Roles', "Deleted role {$role->role_name}");
        }
    }
}
