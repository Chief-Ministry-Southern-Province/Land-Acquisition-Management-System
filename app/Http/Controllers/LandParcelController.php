<?php

namespace App\Http\Controllers;

use App\Models\LandParcel;
use App\Models\Projects;
use App\Models\PropertyOwner;
use App\Services\ExportService;
use App\Services\ImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LandParcelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Land parcels fetched successfully',
            'land_parcels' => LandParcel::with(['owners', 'project'])->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'parcel_id' => 'required|string|max:255|unique:land_parcels,parcel_id',
            'project_id' => 'nullable|exists:projects,id',
            'lot_no' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'extent_acers' => 'required|numeric',
            'extent_perches' => 'required|numeric',
            'remarks' => 'nullable|string',
            'status' => 'nullable|string|in:available,pending,acquired',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
        ]);

        $validated['status'] = 'available';
        $landParcel = LandParcel::create($validated);
        if ($request->has('property_owner_ids') && is_array($request->input('property_owner_ids'))) {
            $landParcel->owners()->attach($request->input('property_owner_ids'));
        } elseif ($request->has('property_owner_id') && $request->input('property_owner_id')) {
            $landParcel->owners()->attach($request->input('property_owner_id'));
        }
        $landParcel->load(['owners', 'project']);

        return response()->json([
            'message' => 'Land parcel created successfully',
            'land_parcel' => $landParcel,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $landParcel = LandParcel::with(['owners', 'project'])->find($id);

        if ($landParcel) {
            return response()->json([
                'message' => 'Land parcel fetched successfully',
                'land_parcel' => $landParcel,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Land parcel not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'parcel_id' => 'required|string|max:255|unique:land_parcels,parcel_id,'.$id,
            'project_id' => 'nullable|exists:projects,id',
            'lot_no' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'extent_acers' => 'required|numeric',
            'extent_perches' => 'required|numeric',
            'remarks' => 'nullable|string',
            'status' => 'required|string|in:available,pending,acquired',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
        ]);

        $landParcel = LandParcel::find($id, ['*']);

        if (! $landParcel) {
            return response()->json([
                'message' => 'Land parcel not found',
            ], 404);
        }

        $landParcel->update($validated);
        if ($request->has('property_owner_ids') && is_array($request->input('property_owner_ids'))) {
            $landParcel->owners()->sync($request->input('property_owner_ids'));
        } elseif ($request->has('property_owner_id')) {
            $ownerId = $request->input('property_owner_id');
            if ($ownerId) {
                $landParcel->owners()->sync([$ownerId]);
            } else {
                $landParcel->owners()->detach();
            }
        }
        $landParcel->load(['owners', 'project']);

        return response()->json([
            'message' => 'Land parcel updated successfully',
            'land_parcel' => $landParcel,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $landParcel = LandParcel::find($id, ['*']);

        if (! $landParcel) {
            return response()->json([
                'message' => 'Land parcel not found',
            ], 404);
        }

        $landParcel->delete();

        return response()->json([
            'message' => 'Land parcel deleted successfully',
        ], 204);
    }

    public function export(Request $request, ExportService $exportService)
    {
        $format = $request->query('format', 'pdf');
        $records = LandParcel::with(['owners', 'project'])->get();

        $filename = 'land_parcels_'.date('Ymd_His');

        if ($format === 'pdf') {
            return $exportService->export(
                data: collect([]),
                headings: [],
                filename: $filename,
                format: $format,
                pdfView: 'pdf.land_parcels',
                pdfData: ['parcels' => $records]
            );
        }

        $headings = [
            'Parcel Number',
            'Associated Project',
            'Lot No',
            'District',
            'Division',
            'Village',
            'Owner Name',
            'Extent',
            'Remarks',
            'Current Status',
            'Created At',
        ];

        $data = $records->map(function ($parcel) {
            $ownersList = $parcel->owners->pluck('name')->implode(', ');

            return [
                'parcel_id' => $parcel->parcel_id,
                'project' => $parcel->project?->name ?? 'N/A',
                'lot_no' => $parcel->lot_no,
                'district' => $parcel->district,
                'division' => $parcel->division,
                'village' => $parcel->village,
                'owners' => $ownersList ?: 'N/A',
                'extent' => "{$parcel->extent_acers} ac, {$parcel->extent_perches} per",
                'remarks' => $parcel->remarks ?? 'N/A',
                'status' => ucfirst($parcel->status),
                'created_at' => $parcel->created_at ? $parcel->created_at->format('Y-m-d H:i:s') : 'N/A',
            ];
        });

        return $exportService->export(
            data: $data,
            headings: $headings,
            filename: $filename,
            format: $format
        );
    }

    public function import(Request $request, ImportService $importService)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv,txt|max:10240',
        ]);

        $columnMap = [
            'parcel_id' => 'Parcel Number',
            'lot_no' => 'Lot No',
            'district' => 'District',
            'division' => 'Division',
            'village' => 'Village',
            'remarks' => 'Remarks',
            'status' => 'Current Status',
        ];

        $validationRules = [
            'parcel_id' => 'required|string|max:255|unique:land_parcels,parcel_id',
            'lot_no' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'status' => 'nullable|string|in:available,pending,acquired,Available,Pending,Acquired,AVAILABLE,PENDING,ACQUIRED',
        ];

        $normalizeFields = [
            'status' => 'lowercase',
        ];

        $transform = function ($mappedData, $row) {
            return DB::transaction(function () use ($mappedData, $row) {
                // 1. Resolve project
                $projectField = null;
                if (isset($row['associated_project'])) {
                    $projectField = $row['associated_project'];
                } elseif (isset($row['project'])) {
                    $projectField = $row['project'];
                }

                if ($projectField && trim($projectField) !== 'N/A') {
                    $project = Projects::where('name', trim($projectField))
                        ->orWhere('project_id', trim($projectField))
                        ->first();
                    if ($project) {
                        $mappedData['project_id'] = $project->id;
                    }
                }

                // 2. Parse extent
                $acers = 0;
                $perches = 0;

                // Try combined Extent column first
                $extentField = null;
                if (isset($row['extent'])) {
                    $extentField = $row['extent'];
                }

                if ($extentField) {
                    if (preg_match('/([\d\.]+)\s*(?:ac|acer|acres?)/i', $extentField, $matches)) {
                        $acers = (float) $matches[1];
                    }
                    if (preg_match('/([\d\.]+)\s*(?:per|perch|perches?)/i', $extentField, $matches)) {
                        $perches = (float) $matches[1];
                    }
                }

                // Override with separate columns if they exist
                if (isset($row['extent_acers'])) {
                    $acers = (float) $row['extent_acers'];
                } elseif (isset($row['extent_acres'])) {
                    $acers = (float) $row['extent_acres'];
                }

                if (isset($row['extent_perches'])) {
                    $perches = (float) $row['extent_perches'];
                }

                $mappedData['extent_acers'] = $acers;
                $mappedData['extent_perches'] = $perches;

                // 3. Handle default status
                if (empty($mappedData['status'])) {
                    $mappedData['status'] = 'available';
                } else {
                    $mappedData['status'] = strtolower(trim($mappedData['status']));
                    if (! in_array($mappedData['status'], ['available', 'pending', 'acquired'])) {
                        $mappedData['status'] = 'available';
                    }
                }

                // 4. Create and save model so we can attach relationships
                $landParcel = LandParcel::create($mappedData);

                // 5. Resolve and attach owners
                $ownersField = null;
                if (isset($row['owner_name'])) {
                    $ownersField = $row['owner_name'];
                } elseif (isset($row['owners'])) {
                    $ownersField = $row['owners'];
                }

                if ($ownersField && trim($ownersField) !== 'N/A') {
                    $ownerNames = array_map('trim', explode(',', $ownersField));
                    foreach ($ownerNames as $name) {
                        if (empty($name)) {
                            continue;
                        }
                        // Find existing owner or create a new one
                        $owner = PropertyOwner::where('name', $name)->first();
                        if (! $owner) {
                            $ownerId = 'OWN-'.strtoupper(Str::random(6));
                            while (PropertyOwner::where('owner_id', $ownerId)->exists()) {
                                $ownerId = 'OWN-'.strtoupper(Str::random(6));
                            }

                            $owner = PropertyOwner::create([
                                'owner_id' => $ownerId,
                                'name' => $name,
                                'nic' => 'N/A',
                                'address' => 'N/A',
                                'contact' => 'N/A',
                            ]);
                        }
                        $landParcel->owners()->attach($owner->id);
                    }
                }

                // Return null to signal to GenericImport that we handled saving
                return null;
            });
        };

        try {
            $result = $importService->importFromFile(
                modelClass: LandParcel::class,
                file: $request->file('file'),
                columnMap: $columnMap,
                validationRules: $validationRules,
                staticValues: [],
                normalizeFields: $normalizeFields,
                transform: $transform,
                userId: $request->user()?->id
            );

            if ($result['success']) {
                return response()->json([
                    'message' => 'Land parcels imported successfully',
                    'imported_count' => $result['imported_count'],
                    'failures' => $result['failures'],
                ], 200);
            }

            return response()->json([
                'message' => 'Import failed due to validation errors',
                'imported_count' => $result['imported_count'],
                'failures' => $result['failures'],
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Import failed: '.$e->getMessage(),
            ], 500);
        }
    }
}
