<?php

namespace App\Observers;

use App\Models\Projects;
use App\Services\AuditLogService;

class ProjectsObserver
{
    /**
     * Handle the Projects "created" event.
     */
    public function created(Projects $projects): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Projects', "Created project {$projects->name}");
        }
    }

    /**
     * Handle the Projects "updated" event.
     */
    public function updated(Projects $projects): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Projects', "Updated project {$projects->name}");
        }
    }

    /**
     * Handle the Projects "deleted" event.
     */
    public function deleted(Projects $projects): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Projects', "Deleted project {$projects->name}");
        }
    }
}
