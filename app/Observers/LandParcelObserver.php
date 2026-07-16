<?php

namespace App\Observers;

use App\Models\LandParcel;
use App\Services\AuditLogService;

class LandParcelObserver
{
    /**
     * Handle the LandParcel "created" event.
     */
    public function created(LandParcel $landParcel): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Create', 'Land Parcels', "Created land parcel {$landParcel->parcel_id}");
        }
    }

    /**
     * Handle the LandParcel "updated" event.
     */
    public function updated(LandParcel $landParcel): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Update', 'Land Parcels', "Updated land parcel {$landParcel->parcel_id}");
        }
    }

    /**
     * Handle the LandParcel "deleted" event.
     */
    public function deleted(LandParcel $landParcel): void
    {
        if ($user = auth()->user()) {
            AuditLogService::log($user->id, $user->name, 'Delete', 'Land Parcels', "Deleted land parcel {$landParcel->parcel_id}");
        }
    }
}
