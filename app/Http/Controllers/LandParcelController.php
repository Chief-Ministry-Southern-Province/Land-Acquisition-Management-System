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
            'document_id' => 'nullable|exists:documents,id',
            'land_name' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'nullable|string|max:255',
            'divisional_secretariat' => 'nullable|string|max:255',
            'grama_niladari_division' => 'nullable|string|max:255',
            'village' => 'required|string|max:255',
            'extent_acers' => 'nullable|numeric',
            'extent_perches' => 'nullable|numeric',
            'land_size_acers' => 'nullable|numeric',
            'land_size_roods' => 'nullable|numeric',
            'land_size_perches' => 'nullable|numeric',
            'full_land_size' => 'nullable|numeric',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'boundary_geojson' => 'nullable|array',
            'has_plan' => 'nullable|boolean',
            'plan_number' => 'nullable|string|max:255',
            'parcel_numbers' => 'nullable|array',
            'boundaries_north' => 'nullable|string|max:255',
            'boundaries_south' => 'nullable|string|max:255',
            'boundaries_east' => 'nullable|string|max:255',
            'boundaries_west' => 'nullable|string|max:255',
            'has_residential_houses' => 'nullable|boolean',
            'is_resident_owner' => 'nullable|boolean',
            'cultivation' => 'nullable|string|max:255',
            'cultivation_status' => 'nullable|string|in:fertile,mid,infertile',
            'annual_income' => 'nullable|numeric',
            'land_type' => 'nullable|string|max:255',
            'estimated_value' => 'nullable|numeric',
            'remarks' => 'nullable|string',
            'status' => 'nullable|string|in:available,pending,acquired',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
        ]);

        $validated['land_name'] = $validated['land_name'] ?? 'Land Parcel ' . $validated['parcel_id'];
        $validated['province'] = $validated['province'] ?? 'Southern';
        $validated['divisional_secretariat'] = $validated['divisional_secretariat'] ?? ($validated['division'] ?? 'N/A');
        $validated['grama_niladari_division'] = $validated['grama_niladari_division'] ?? 'N/A';
        $validated['land_size_acers'] = $validated['land_size_acers'] ?? ($validated['extent_acers'] ?? 0);
        $validated['land_size_roods'] = $validated['land_size_roods'] ?? 0;
        $validated['land_size_perches'] = $validated['land_size_perches'] ?? ($validated['extent_perches'] ?? 0);
        $validated['full_land_size'] = $validated['full_land_size'] ?? (($validated['land_size_acers'] * 160) + $validated['land_size_perches']);
        $validated['has_plan'] = $validated['has_plan'] ?? false;
        $validated['parcel_numbers'] = $validated['parcel_numbers'] ?? [];
        $validated['has_residential_houses'] = $validated['has_residential_houses'] ?? false;
        $validated['is_resident_owner'] = $validated['is_resident_owner'] ?? false;
        $validated['cultivation'] = $validated['cultivation'] ?? 'N/A';
        $validated['cultivation_status'] = $validated['cultivation_status'] ?? 'fertile';
        $validated['annual_income'] = $validated['annual_income'] ?? 0;
        $validated['land_type'] = $validated['land_type'] ?? 'Standard';
        $validated['estimated_value'] = $validated['estimated_value'] ?? 0;

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
            'parcel_id' => 'required|string|max:255|unique:land_parcels,parcel_id,' . $id,
            'project_id' => 'nullable|exists:projects,id',
            'document_id' => 'nullable|exists:documents,id',
            'land_name' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'nullable|string|max:255',
            'divisional_secretariat' => 'nullable|string|max:255',
            'grama_niladari_division' => 'nullable|string|max:255',
            'village' => 'required|string|max:255',
            'extent_acers' => 'nullable|numeric',
            'extent_perches' => 'nullable|numeric',
            'land_size_acers' => 'nullable|numeric',
            'land_size_roods' => 'nullable|numeric',
            'land_size_perches' => 'nullable|numeric',
            'full_land_size' => 'nullable|numeric',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'boundary_geojson' => 'nullable|array',
            'has_plan' => 'nullable|boolean',
            'plan_number' => 'nullable|string|max:255',
            'parcel_numbers' => 'nullable|array',
            'boundaries_north' => 'nullable|string|max:255',
            'boundaries_south' => 'nullable|string|max:255',
            'boundaries_east' => 'nullable|string|max:255',
            'boundaries_west' => 'nullable|string|max:255',
            'has_residential_houses' => 'nullable|boolean',
            'is_resident_owner' => 'nullable|boolean',
            'cultivation' => 'nullable|string|max:255',
            'cultivation_status' => 'nullable|string|in:fertile,mid,infertile',
            'annual_income' => 'nullable|numeric',
            'land_type' => 'nullable|string|max:255',
            'estimated_value' => 'nullable|numeric',
            'remarks' => 'nullable|string',
            'status' => 'required|string|in:available,pending,acquired',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
        ]);

        if (isset($validated['division']) && ! isset($validated['divisional_secretariat'])) {
            $validated['divisional_secretariat'] = $validated['division'];
        }
        if (isset($validated['extent_acers']) && ! isset($validated['land_size_acers'])) {
            $validated['land_size_acers'] = $validated['extent_acers'];
        }
        if (isset($validated['extent_perches']) && ! isset($validated['land_size_perches'])) {
            $validated['land_size_perches'] = $validated['extent_perches'];
        }

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

        $filename = 'land_parcels_' . date('Ymd_His');

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
            'Land Name',
            'District',
            'Divisional Secretariat',
            'Village',
            'Owner Name',
            'Extent',
            'Remarks',
            'Current Status',
            'Created At',
        ];

        $data = $records->map(function ($parcel) {
            $ownersList = $parcel->owners->pluck('name')->implode(', ');
            $projectName = $parcel->project?->title ?? ($parcel->project?->name ?? 'N/A');
            $divSec = $parcel->divisional_secretariat ?? ($parcel->division ?? 'N/A');
            $acers = $parcel->land_size_acers ?? ($parcel->extent_acers ?? 0);
            $perches = $parcel->land_size_perches ?? ($parcel->extent_perches ?? 0);

            return [
                'parcel_id' => $parcel->parcel_id,
                'project' => $projectName,
                'land_name' => $parcel->land_name ?? 'N/A',
                'district' => $parcel->district,
                'division' => $divSec,
                'village' => $parcel->village,
                'owners' => $ownersList ?: 'N/A',
                'extent' => "{$acers} ac, {$perches} per",
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
            'land_name' => 'Land Name',
            'district' => 'District',
            'divisional_secretariat' => 'Division',
            'village' => 'Village',
            'remarks' => 'Remarks',
            'status' => 'Current Status',
        ];

        $validationRules = [
            'parcel_id' => 'required|string|max:255|unique:land_parcels,parcel_id',
            'district' => 'required|string|max:255',
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
                    $project = Projects::where('title', trim($projectField))
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
                } elseif (isset($row['land_size_acers'])) {
                    $acers = (float) $row['land_size_acers'];
                }

                if (isset($row['extent_perches'])) {
                    $perches = (float) $row['extent_perches'];
                } elseif (isset($row['land_size_perches'])) {
                    $perches = (float) $row['land_size_perches'];
                }

                $mappedData['land_name'] = $mappedData['land_name'] ?? ('Land Parcel ' . $mappedData['parcel_id']);
                $mappedData['province'] = $mappedData['province'] ?? 'Southern';
                $mappedData['divisional_secretariat'] = $mappedData['divisional_secretariat'] ?? ($row['division'] ?? 'N/A');
                $mappedData['grama_niladari_division'] = $mappedData['grama_niladari_division'] ?? 'N/A';
                $mappedData['land_size_acers'] = $acers;
                $mappedData['land_size_roods'] = 0;
                $mappedData['land_size_perches'] = $perches;
                $mappedData['full_land_size'] = ($acers * 160) + $perches;
                $mappedData['has_plan'] = false;
                $mappedData['parcel_numbers'] = [];
                $mappedData['has_residential_houses'] = false;
                $mappedData['is_resident_owner'] = false;
                $mappedData['cultivation'] = 'N/A';
                $mappedData['cultivation_status'] = 'fertile';
                $mappedData['annual_income'] = 0;
                $mappedData['land_type'] = 'Standard';
                $mappedData['estimated_value'] = 0;

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
                            $ownerId = 'OWN-' . strtoupper(Str::random(6));
                            while (PropertyOwner::where('owner_id', $ownerId)->exists()) {
                                $ownerId = 'OWN-' . strtoupper(Str::random(6));
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
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
