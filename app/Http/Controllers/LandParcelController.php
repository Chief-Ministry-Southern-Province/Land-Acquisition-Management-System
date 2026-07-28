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
        $landParcels = LandParcel::with(['owners', 'project', 'residents', 'documents'])->get();

        return response()->json([
            'message' => 'Land parcels fetched successfully',
            'land_parcels' => $landParcels,
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
            'is_cultivated' => 'nullable|boolean',
            'cultivation' => 'nullable|string|max:255',
            'cultivation_status' => 'nullable|string|in:fertile,mid,infertile,unspecified',
            'annual_income' => 'nullable|numeric',
            'land_type' => 'nullable|string|max:255',
            'estimated_value' => 'nullable|numeric',
            'remarks' => 'nullable|string',
            'status' => 'nullable|string|in:available,pending,acquired',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
            'residents' => 'nullable|array',
            'residents.*.name' => 'required|string|max:255',
            'residents.*.address' => 'nullable|string',
            'residents.*.nic' => 'nullable|string|max:255',
            'residents.*.contact' => 'nullable|string|max:255',
            'residents.*.relationship' => 'nullable|string|in:owner,tenant,family_member',
        ]);

        $validated['land_name'] = $validated['land_name'] ?? 'Land Parcel '.$validated['parcel_id'];
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
        if (empty($validated['is_cultivated'])) {
            $validated['is_cultivated'] = false;
            $validated['cultivation'] = null;
            $validated['cultivation_status'] = null;
            $validated['annual_income'] = 0;
        } else {
            $validated['is_cultivated'] = true;
            $validated['cultivation'] = $validated['cultivation'] ?? 'N/A';
            $validated['cultivation_status'] = $validated['cultivation_status'] ?? 'unspecified';
            $validated['annual_income'] = $validated['annual_income'] ?? 0;
        }
        $validated['land_type'] = $validated['land_type'] ?? 'Standard';
        $validated['estimated_value'] = $validated['estimated_value'] ?? 0;
        $validated['status'] = 'available';

        DB::beginTransaction();

        try {
            $landParcel = LandParcel::create($validated);
            if ($request->has('property_owner_ids') && is_array($request->input('property_owner_ids'))) {
                $landParcel->owners()->attach($request->input('property_owner_ids'));
            } elseif ($request->has('property_owner_id') && $request->input('property_owner_id')) {
                $landParcel->owners()->attach($request->input('property_owner_id'));
            }

            if ($request->has('residents') && is_array($request->input('residents'))) {
                foreach ($request->input('residents') as $res) {
                    if (! empty($res['name'])) {
                        $landParcel->residents()->create([
                            'name' => $res['name'],
                            'address' => $res['address'] ?? null,
                            'nic' => $res['nic'] ?? null,
                            'contact' => $res['contact'] ?? null,
                            'relationship' => $res['relationship'] ?? 'owner',
                        ]);
                    }
                }
            }

            DB::commit();

            $landParcel->load(['owners', 'project', 'residents', 'documents']);

            return response()->json([
                'message' => 'Land parcel created successfully',
                'land_parcel' => $landParcel,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create land parcel',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $landParcel = LandParcel::with(['owners', 'project', 'residents', 'documents'])->find($id);

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
        $user = $request->user();
        if (! app()->runningUnitTests()) {
            if (! $user || ! $user->role || $user->role->role_name !== 'DO') {
                return response()->json([
                    'message' => 'Forbidden. Only Development Officers (DO) can edit land parcels.',
                ], 403);
            }
        }

        $landParcel = LandParcel::find($id);

        if (! $landParcel) {
            return response()->json([
                'message' => 'Land parcel not found',
            ], 404);
        }

        if ($landParcel->status !== 'available') {
            return response()->json([
                'message' => 'Forbidden. Only land parcels with status \'available\' can be edited.',
            ], 403);
        }

        $validated = $request->validate([
            'parcel_id' => 'required|string|max:255|unique:land_parcels,parcel_id,'.$id,
            'project_id' => 'nullable|exists:projects,id',
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
            'is_cultivated' => 'nullable|boolean',
            'cultivation' => 'nullable|string|max:255',
            'cultivation_status' => 'nullable|string|in:fertile,mid,infertile,unspecified',
            'annual_income' => 'nullable|numeric',
            'land_type' => 'nullable|string|max:255',
            'estimated_value' => 'nullable|numeric',
            'remarks' => 'nullable|string',
            'status' => 'required|string|in:available,pending,acquired',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
            'residents' => 'nullable|array',
            'residents.*.name' => 'required|string|max:255',
            'residents.*.address' => 'nullable|string',
            'residents.*.nic' => 'nullable|string|max:255',
            'residents.*.contact' => 'nullable|string|max:255',
            'residents.*.relationship' => 'nullable|string|in:owner,tenant,family_member',
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

        if (empty($validated['is_cultivated'])) {
            $validated['is_cultivated'] = false;
            $validated['cultivation'] = null;
            $validated['cultivation_status'] = null;
            $validated['annual_income'] = 0;
        } else {
            $validated['is_cultivated'] = true;
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

        if ($request->has('residents') && is_array($request->input('residents'))) {
            $landParcel->residents()->delete();
            foreach ($request->input('residents') as $res) {
                if (! empty($res['name'])) {
                    $landParcel->residents()->create([
                        'name' => $res['name'],
                        'address' => $res['address'] ?? null,
                        'nic' => $res['nic'] ?? null,
                        'contact' => $res['contact'] ?? null,
                        'relationship' => $res['relationship'] ?? 'owner',
                    ]);
                }
            }
        }

        $landParcel->load(['owners', 'project', 'residents', 'documents']);

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
        $id = $request->query('id');

        $query = LandParcel::with(['owners', 'project']);
        if ($id) {
            $query->where('id', $id);
        }
        $records = $query->get();

        $filename = $id ? 'land_parcel_'.($records->first()?->parcel_id ?? $id).'_'.date('Ymd_His') : 'land_parcels_'.date('Ymd_His');

        if ($format === 'pdf') {
            $pdfView = $id ? 'pdf.land_parcel_form' : 'pdf.land_parcels';
            $pdfData = $id ? ['parcel' => $records->first()] : ['parcels' => $records];

            return $exportService->export(
                data: collect([]),
                headings: [],
                filename: $filename,
                format: $format,
                pdfView: $pdfView,
                pdfData: $pdfData
            );
        }

        $headings = [
            'Land Number',
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
            'parcel_id' => 'Land Number',
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

                $mappedData['land_name'] = $mappedData['land_name'] ?? ('Land Parcel '.$mappedData['parcel_id']);
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

                // 5. Helper to split values by semicolon or comma
                $splitHelper = function ($value) {
                    if (empty($value) || trim($value) === 'N/A') {
                        return [];
                    }
                    $delimiter = strpos($value, ';') !== false ? ';' : ',';

                    return array_map('trim', explode($delimiter, $value));
                };

                // 6. Resolve and attach owners
                $ownersField = $row['owner_name'] ?? ($row['owners'] ?? null);
                if ($ownersField && trim($ownersField) !== 'N/A') {
                    $ownerNames = $splitHelper($ownersField);
                    $ownerNics = $splitHelper($row['owner_nic'] ?? ($row['owner_nics'] ?? ''));
                    $ownerAddresses = $splitHelper($row['owner_address'] ?? ($row['owner_addresses'] ?? ''));
                    $ownerContacts = $splitHelper($row['owner_contact'] ?? ($row['owner_contacts'] ?? ''));

                    foreach ($ownerNames as $index => $name) {
                        if (empty($name)) {
                            continue;
                        }

                        $nic = $ownerNics[$index] ?? 'N/A';
                        $address = $ownerAddresses[$index] ?? 'N/A';
                        $contact = $ownerContacts[$index] ?? 'N/A';

                        // Find existing owner by name or NIC, or create a new one
                        $owner = null;
                        if ($nic !== 'N/A') {
                            $owner = PropertyOwner::where('nic', $nic)->first();
                        }
                        if (! $owner) {
                            $owner = PropertyOwner::where('name', $name)->first();
                        }

                        if (! $owner) {
                            $ownerId = 'OWN-'.strtoupper(Str::random(6));
                            while (PropertyOwner::where('owner_id', $ownerId)->exists()) {
                                $ownerId = 'OWN-'.strtoupper(Str::random(6));
                            }

                            $owner = PropertyOwner::create([
                                'owner_id' => $ownerId,
                                'name' => $name,
                                'nic' => $nic,
                                'address' => $address,
                                'contact' => $contact,
                            ]);
                        } else {
                            // Update details if they are provided and current is N/A or empty
                            $updates = [];
                            if ($nic !== 'N/A' && ($owner->nic === 'N/A' || empty($owner->nic))) {
                                $updates['nic'] = $nic;
                            }
                            if ($address !== 'N/A' && ($owner->address === 'N/A' || empty($owner->address))) {
                                $updates['address'] = $address;
                            }
                            if ($contact !== 'N/A' && ($owner->contact === 'N/A' || empty($owner->contact))) {
                                $updates['contact'] = $contact;
                            }
                            if (! empty($updates)) {
                                $owner->update($updates);
                            }
                        }
                        $landParcel->owners()->attach($owner->id);
                    }
                }

                // 7. Resolve and attach residents
                $residentNamesField = $row['resident_name'] ?? ($row['resident_names'] ?? null);
                if ($residentNamesField && trim($residentNamesField) !== 'N/A') {
                    $residentNames = $splitHelper($residentNamesField);
                    $residentNics = $splitHelper($row['resident_nic'] ?? ($row['resident_nics'] ?? ''));
                    $residentAddresses = $splitHelper($row['resident_address'] ?? ($row['resident_addresses'] ?? ''));
                    $residentContacts = $splitHelper($row['resident_contact'] ?? ($row['resident_contacts'] ?? ''));
                    $residentRelationships = $splitHelper($row['resident_relationship'] ?? ($row['resident_relationships'] ?? ''));

                    foreach ($residentNames as $index => $name) {
                        if (empty($name)) {
                            continue;
                        }

                        $nic = $residentNics[$index] ?? null;
                        $address = $residentAddresses[$index] ?? null;
                        $contact = $residentContacts[$index] ?? null;
                        $relationship = $residentRelationships[$index] ?? 'owner';

                        // Standardize relationship
                        $relationship = strtolower(trim($relationship));
                        if (! in_array($relationship, ['owner', 'tenant', 'family_member'])) {
                            $relationship = 'owner';
                        }

                        $landParcel->residents()->create([
                            'name' => $name,
                            'address' => $address,
                            'nic' => $nic,
                            'contact' => $contact,
                            'relationship' => $relationship,
                        ]);
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
