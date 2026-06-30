<?php

namespace App\Http\Controllers;

use App\Models\LandParcel;
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
            'land_parcels' => LandParcel::all(),
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
        ]);

        $landParcel = LandParcel::create($validated);

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
        $landParcel = LandParcel::find($id, ['*']);

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
        ]);

        $landParcel = LandParcel::find($id, ['*']);

        if (! $landParcel) {
            return response()->json([
                'message' => 'Land parcel not found',
            ], 404);
        }

        $landParcel->update($validated);

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
}
