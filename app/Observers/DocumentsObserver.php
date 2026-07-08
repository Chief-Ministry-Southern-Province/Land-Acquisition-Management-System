<?php

namespace App\Observers;

use App\Models\Documents;
use App\Services\AuditLogService;

class DocumentsObserver
{
    /**
     * Handle the Documents "created" event.
     */
    public function created(Documents $document): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Documents', "Created document {$document->name}");
        }
    }

    /**
     * Handle the Documents "updated" event.
     */
    public function updated(Documents $document): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Documents', "Updated document {$document->name}");
        }
    }

    /**
     * Handle the Documents "deleted" event.
     */
    public function deleted(Documents $document): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Documents', "Deleted document {$document->name}");
        }
    }
}
