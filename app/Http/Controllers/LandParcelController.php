<?php

namespace App\Http\Controllers;

use App\Models\LandParcel;
use App\Services\ExportService;
use Illuminate\Http\Request;

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
            'status' => 'required|string|in:available,pending,acquired,in-progress',
            'property_owner_id' => 'nullable|exists:property_owners,id',
            'property_owner_ids' => 'nullable|array',
            'property_owner_ids.*' => 'exists:property_owners,id',
        ]);

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
            'status' => 'required|string|in:available,pending,acquired,in-progress',
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
}
