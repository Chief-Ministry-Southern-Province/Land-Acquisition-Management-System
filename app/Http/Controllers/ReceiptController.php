<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Receipt::with(['landParcel', 'document']);

        if ($request->has('land_parcel_id')) {
            $query->where('land_parcel_id', $request->input('land_parcel_id'));
        }

        return response()->json([
            'message' => 'Receipts fetched successfully',
            'receipts' => $query->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'receipt_number' => 'required|string|max:255',
            'receipt_date' => 'required|date',
            'received_from' => 'required|string|max:255',
            'amount_rupees' => 'required|numeric|min:0',
            'amount_cents' => 'nullable|integer|min:0|max:99',
            'reason' => 'required|string',
            'document_id' => 'required|exists:documents,id',
        ]);

        $validated['amount_cents'] = $validated['amount_cents'] ?? 0;

        $receipt = Receipt::create($validated);

        return response()->json([
            'message' => 'Receipt saved successfully',
            'receipt' => $receipt->load(['landParcel', 'document']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $receipt = Receipt::with(['landParcel', 'document'])->find($id);

        if (! $receipt) {
            return response()->json([
                'message' => 'Receipt not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Receipt fetched successfully',
            'receipt' => $receipt,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $receipt = Receipt::find($id);

        if (! $receipt) {
            return response()->json([
                'message' => 'Receipt not found',
            ], 404);
        }

        $validated = $request->validate([
            'land_parcel_id' => 'required|exists:land_parcels,id',
            'receipt_number' => 'required|string|max:255',
            'receipt_date' => 'required|date',
            'received_from' => 'required|string|max:255',
            'amount_rupees' => 'required|numeric|min:0',
            'amount_cents' => 'nullable|integer|min:0|max:99',
            'reason' => 'required|string',
            'document_id' => 'required|exists:documents,id',
        ]);

        $validated['amount_cents'] = $validated['amount_cents'] ?? 0;

        $receipt->update($validated);

        return response()->json([
            'message' => 'Receipt updated successfully',
            'receipt' => $receipt->load(['landParcel', 'document']),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $receipt = Receipt::find($id);

        if (! $receipt) {
            return response()->json([
                'message' => 'Receipt not found',
            ], 404);
        }

        $receipt->delete();

        return response()->json([
            'message' => 'Receipt deleted successfully',
        ], 200);
    }
}
