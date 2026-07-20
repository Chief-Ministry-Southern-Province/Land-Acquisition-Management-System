<?php

namespace App\Services;

use App\Imports\GenericImport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;

class ImportService
{
    public function importFromFile(
        string $modelClass,
        UploadedFile $file,
        array $columnMap,
        array $validationRules = [],
        array $staticValues = [],
        array $normalizeFields = [],
        ?\Closure $transform = null,
        ?int $userId = null,
    ): array {
        $import = new GenericImport(
            modelClass: $modelClass,
            columnMap: $columnMap,
            validationRules: $validationRules,
            staticValues: $staticValues,
            normalizeFields: $normalizeFields,
            transform: $transform
        );

        Excel::import($import, $file);

        $failures = [];
        foreach ($import->failures() as $failure) {
            $failures[] = [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
                'values' => $failure->values(),
            ];
        }

        $importedCount = $import->getImportedCount();

        if ($userId && $importedCount > 0) {
            $user = User::find($userId);
            if ($user) {
                // Determine module name from modelClass name
                $modelName = class_basename($modelClass);
                $module = 'General';
                if ($modelName === 'LandParcel') {
                    $module = 'Land Parcels';
                } elseif ($modelName === 'Projects' || $modelName === 'Project') {
                    $module = 'Projects';
                }

                AuditLogService::log(
                    userId: $user->id,
                    name: $user->name,
                    action: 'Import',
                    module: $module,
                    detail: "Imported {$importedCount} records into {$modelName}"
                );
            }
        }

        return [
            'success' => count($failures) === 0,
            'imported_count' => $importedCount,
            'failures' => $failures,
        ];
    }
}
