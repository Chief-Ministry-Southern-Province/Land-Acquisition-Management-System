<?php

namespace App\Observers;

use App\Models\PropertyOwner;
use App\Services\AuditLogService;

class PropertyOwnerObserver
{
    /**
     * Handle the PropertyOwner "created" event.
     */
    public function created(PropertyOwner $propertyOwner): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Property Owners', "Created property owner {$propertyOwner->name}");
        }
    }

    /**
     * Handle the PropertyOwner "updated" event.
     */
    public function updated(PropertyOwner $propertyOwner): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Property Owners', "Updated property owner {$propertyOwner->name}");
        }
    }

    /**
     * Handle the PropertyOwner "deleted" event.
     */
    public function deleted(PropertyOwner $propertyOwner): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Property Owners', "Deleted property owner {$propertyOwner->name}");
        }
    }
}
