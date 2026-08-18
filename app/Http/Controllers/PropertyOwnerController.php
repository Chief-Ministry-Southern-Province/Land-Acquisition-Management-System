<?php

namespace App\Http\Controllers;

use App\Models\PropertyOwner;
use App\Services\ExportService;
use Illuminate\Http\Request;

class PropertyOwnerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->role || !in_array($user->role->role_name, ['DO', 'HOB', 'AO', 'AS', 'SAS', 'SEC'])) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ], 403);
        }

        return response()->json([
            'message' => 'Property owners fetched successfully',
            'property_owners' => PropertyOwner::with('landParcels')->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can perform this action.',
            ], 403);
        }

        $validated = $request->validate([
            'owner_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'nic' => 'nullable|string|max:255|unique:property_owners,nic',
            'address' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
        ]);

        $propertyOwner = PropertyOwner::create($validated);
        $propertyOwner->load(['landParcels', 'compensations.landParcel', 'documents']);

        return response()->json([
            'message' => 'Property owner created successfully',
            'property_owner' => $propertyOwner,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        if (!$user || !$user->role || !in_array($user->role->role_name, ['DO', 'HOB', 'AO', 'AS', 'SAS', 'SEC'])) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ], 403);
        }

        $propertyOwner = PropertyOwner::with(['landParcels', 'compensations.landParcel', 'documents'])->find($id);

        if ($propertyOwner) {
            return response()->json([
                'message' => 'Property owner fetched successfully',
                'property_owner' => $propertyOwner,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Property owner not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        if (!$user || !$user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can perform this action.',
            ], 403);
        }

        $validated = $request->validate([
            'owner_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'nic' => 'nullable|string|max:255|unique:property_owners,nic,'.$id,
            'address' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
        ]);

        $propertyOwner = PropertyOwner::find($id, ['*']);

        if (! $propertyOwner) {
            return response()->json([
                'message' => 'Property owner not found',
            ], 404);
        }

        $propertyOwner->update($validated);
        $propertyOwner->load(['landParcels', 'compensations.landParcel', 'documents']);

        return response()->json([
            'message' => 'Property owner updated successfully',
            'property_owner' => $propertyOwner,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        if (!$user || !$user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can perform this action.',
            ], 403);
        }

        $propertyOwner = PropertyOwner::find($id, ['*']);

        if (! $propertyOwner) {
            return response()->json([
                'message' => 'Property owner not found',
            ], 404);
        }

        $propertyOwner->delete();

        return response()->json([
            'message' => 'Property owner deleted successfully',
        ], 204);
    }

    /**
     * Export property owner details.
     */
    public function export(Request $request, ExportService $exportService)
    {
        $format = $request->query('format', 'excel');
        $id = $request->query('id');

        $query = PropertyOwner::with(['landParcels', 'compensations.landParcel', 'documents']);
        if ($id) {
            $query->where('id', $id);
        }
        $records = $query->get();

        if ($id && $records->isEmpty()) {
            return response()->json([
                'message' => 'Property owner not found',
            ], 404);
        }

        $filename = $id
            ? 'property_owner_'.$records->first()->owner_id.'_'.date('Ymd_His')
            : 'property_owners_'.date('Ymd_His');

        if ($format === 'pdf') {
            $pdfView = $id ? 'pdf.property_owner_form' : 'pdf.property_owners';
            $pdfData = $id ? ['owner' => $records->first()] : ['owners' => $records];

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
            __('messages.owner_id'),
            __('messages.full_name'),
            __('messages.nic'),
            __('messages.address'),
            __('messages.contact_number'),
            __('messages.date_of_birth'),
            __('messages.occupation'),
            __('messages.email'),
            __('messages.owned_parcels_count'),
            __('messages.total_compensation_amount'),
            __('messages.created_at'),
        ];

        $data = $records->map(function ($owner) {
            $totalCompensation = $owner->compensations->sum('amount');

            return [
                'owner_id' => $owner->owner_id,
                'name' => $owner->name,
                'nic' => $owner->nic ?? __('messages.n_a'),
                'address' => $owner->address,
                'contact' => $owner->contact ?? __('messages.n_a'),
                'date_of_birth' => $owner->date_of_birth ?? __('messages.n_a'),
                'occupation' => $owner->occupation ?? __('messages.n_a'),
                'email' => $owner->email ?? __('messages.n_a'),
                'parcels_count' => $owner->landParcels->count(),
                'total_compensation' => '₨ '.number_format($totalCompensation, 2),
                'created_at' => $owner->created_at ? $owner->created_at->format('Y-m-d H:i:s') : __('messages.n_a'),
            ];
        });

        return $exportService->export(
            data: $data,
            headings: $headings,
            filename: $filename,
            format: $format
        );
    }
}
