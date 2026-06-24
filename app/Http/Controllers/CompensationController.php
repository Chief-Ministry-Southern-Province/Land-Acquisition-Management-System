<?php

namespace App\Http\Controllers;

use App\Models\Compensation;
use Illuminate\Http\Request;

class CompensationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Compensations fetched successfully',
            'compensations' => Compensation::all(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_id' => 'required|exists:property_owners,id',
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'compensation_id' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'approved_date' => 'required|date',
            'payment_date' => 'required|date',
            'status' => 'required|string|max:255',
        ]);

        $compensation = Compensation::create($validated);

        return response()->json([
            'message' => 'Compensation created successfully',
            'compensation' => $compensation,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $compensation = Compensation::find($id);

        if ($compensation) {
            return response()->json([
                'message' => 'Compensation fetched successfully',
                'compensation' => $compensation,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Compensation not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'owner_id' => 'required|exists:property_owners,id',
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'compensation_id' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'approved_date' => 'required|date',
            'payment_date' => 'required|date',
            'status' => 'required|string|max:255',
        ]);

        $compensation = Compensation::find($id);

        if (!$compensation) {
            return response()->json([
                'message' => 'Compensation not found',
            ], 404);
        }

        $compensation->update($validated);

        return response()->json([
            'message' => 'Compensation updated successfully',
            'compensation' => $compensation,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $compensation = Compensation::find($id);

        if (!$compensation) {
            return response()->json([
                'message' => 'Compensation not found',
            ], 404);
        }

        $compensation->delete();

        return response()->json([
            'message' => 'Compensation deleted successfully',
        ], 204);
    }
}
