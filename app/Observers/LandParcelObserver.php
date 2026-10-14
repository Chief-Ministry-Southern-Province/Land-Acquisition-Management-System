<?php

namespace App\Observers;

use App\Models\Compensation;
use App\Models\Documents;
use App\Models\LandParcel;
use App\Models\LandSurvey;
use App\Models\LandValuation;
use App\Models\Payment;
use App\Models\PropertyOwner;
use App\Models\Receipt;
use App\Models\Resident;
use App\Services\AuditLogService;
use App\Services\FileUploadService;

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
     * Handle the LandParcel "deleting" event.
     */
    public function deleting(LandParcel $landParcel): void
    {
        $fileUploadService = new FileUploadService;
        $documentIdsToDelete = [];

        // 1. Collect and delete Surveys (foreign key document_id has RESTRICT)
        foreach ($landParcel->surveys()->get() as $survey) {
            if ($survey->document_id) {
                $documentIdsToDelete[] = $survey->document_id;
            }
            $survey->delete();
        }

        // 2. Collect and delete Valuations (foreign key document_id has RESTRICT)
        foreach ($landParcel->valuations()->get() as $valuation) {
            if ($valuation->document_id) {
                $documentIdsToDelete[] = $valuation->document_id;
            }
            $valuation->delete();
        }

        // 3. Collect and delete Receipts (foreign key document_id has RESTRICT)
        foreach ($landParcel->receipts()->get() as $receipt) {
            if ($receipt->document_id) {
                $documentIdsToDelete[] = $receipt->document_id;
            }
            $receipt->delete();
        }

        // 4. Collect and delete Compensations and their Payments
        foreach ($landParcel->compensations()->get() as $compensation) {
            foreach ($compensation->payments()->get() as $payment) {
                if ($payment->document_id) {
                    $documentIdsToDelete[] = $payment->document_id;
                }
                $payment->delete();
            }
            $compensation->delete();
        }

        // 5. Delete Residents
        $landParcel->residents()->delete();

        // 6. Collect direct LandParcel Documents
        foreach ($landParcel->documents()->get() as $doc) {
            $documentIdsToDelete[] = $doc->id;
        }

        // 7. Delete collected documents and their physical files
        $documentIdsToDelete = array_unique(array_filter($documentIdsToDelete));
        foreach ($documentIdsToDelete as $docId) {
            $doc = Documents::find($docId);
            if (! $doc) {
                continue;
            }

            // Check if document is referenced elsewhere by other models
            $usedElsewhere = LandSurvey::where('document_id', $doc->id)->exists()
                || LandValuation::where('document_id', $doc->id)->exists()
                || Receipt::where('document_id', $doc->id)->exists()
                || Payment::where('document_id', $doc->id)->exists()
                || Documents::where('id', $doc->id)->where('land_parcel_id', '!=', $landParcel->id)->whereNotNull('land_parcel_id')->exists();

            if (! $usedElsewhere) {
                if (! empty($doc->file_path)) {
                    try {
                        $fileUploadService->delete('acquisition_case_documents', $doc->file_path);
                    } catch (\Throwable $e) {
                        // Suppress storage deletion errors to avoid blocking DB cleanup
                    }
                }
                $doc->delete();
            }
        }

        // Delete any remaining direct documents if any exist
        Documents::where('land_parcel_id', $landParcel->id)->delete();

        // 8. Handle Owners associated with this land parcel
        $owners = $landParcel->owners()->get();
        foreach ($owners as $owner) {
            // Check if owner is linked to any other land parcel
            $linkedToOtherParcel = $owner->landParcels()
                ->where('land_parcels.id', '!=', $landParcel->id)
                ->exists();

            // Detach this parcel from owner
            $landParcel->owners()->detach($owner->id);

            // If not linked to any other parcel, delete the owner and owner's documents
            if (! $linkedToOtherParcel) {
                $ownerDocs = Documents::where('property_owner_id', $owner->id)->get();
                foreach ($ownerDocs as $ownerDoc) {
                    if (! $ownerDoc->land_parcel_id || $ownerDoc->land_parcel_id == $landParcel->id) {
                        if (! empty($ownerDoc->file_path)) {
                            try {
                                $fileUploadService->delete('acquisition_case_documents', $ownerDoc->file_path);
                            } catch (\Throwable $e) {
                                // Suppress storage deletion errors
                            }
                        }
                        $ownerDoc->delete();
                    }
                }

                // Delete any remaining compensations for this owner
                Compensation::where('owner_id', $owner->id)->delete();

                $owner->delete();
            }
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
