<?php

namespace App\Http\Controllers;

use App\Models\LandValuation;
use Illuminate\Http\Request;

class LandValuationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LandValuation::with(['landParcel', 'document']);

        if ($request->has('land_parcel_id')) {
            $query->where('land_parcel_id', $request->input('land_parcel_id'));
        }

        return response()->json([
            'message' => 'Land valuations fetched successfully',
            'land_valuations' => $query->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'valuer_name' => 'required|string|max:255',
            'valuation_date' => 'required|date',
            'valuation_ref_number' => 'required|string|unique:land_valuations,valuation_ref_number',
            'land_value' => 'required|numeric|min:0',
            'crop_value' => 'required|numeric|min:0',
            'structure_value' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:pending,approved,rejected',
            'document_id' => 'required|exists:documents,id',
            'remarks' => 'nullable|string',
        ]);

        $validated['total_valuation'] = $validated['land_value'] + $validated['crop_value'] + $validated['structure_value'];
        $validated['status'] = $validated['status'] ?? 'approved';

        $valuation = LandValuation::create($validated);

        return response()->json([
            'message' => 'Valuation report registered successfully',
            'valuation' => $valuation,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $valuation = LandValuation::with(['landParcel', 'document'])->find($id);

        if (!$valuation) {
            return response()->json([
                'message' => 'Land valuation not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Land valuation fetched successfully',
            'valuation' => $valuation,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $valuation = LandValuation::find($id);

        if (!$valuation) {
            return response()->json([
                'message' => 'Land valuation not found',
            ], 404);
        }

        $validated = $request->validate([
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'valuer_name' => 'required|string|max:255',
            'valuation_date' => 'required|date',
            'valuation_ref_number' => 'required|string|unique:land_valuations,valuation_ref_number,' . $id,
            'land_value' => 'required|numeric|min:0',
            'crop_value' => 'required|numeric|min:0',
            'structure_value' => 'required|numeric|min:0',
            'status' => 'nullable|string|in:pending,approved,rejected',
            'document_id' => 'required|exists:documents,id',
            'remarks' => 'nullable|string',
        ]);

        $validated['total_valuation'] = $validated['land_value'] + $validated['crop_value'] + $validated['structure_value'];

        $valuation->update($validated);

        return response()->json([
            'message' => 'Land valuation updated successfully',
            'valuation' => $valuation,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $valuation = LandValuation::find($id);

        if (!$valuation) {
            return response()->json([
                'message' => 'Land valuation not found',
            ], 404);
        }

        $valuation->delete();

        return response()->json([
            'message' => 'Land valuation deleted successfully',
        ], 200);
    }
}
