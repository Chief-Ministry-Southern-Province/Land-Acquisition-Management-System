<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['compensation', 'document']);

        if ($request->has('compensation_id')) {
            $query->where('compensation_id', $request->input('compensation_id'));
        }

        return response()->json([
            'message' => 'Payments fetched successfully',
            'payments' => $query->get(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'compensation_id' => 'required|exists:compensation,id',
            'payment_reference' => 'required|string|unique:payments,payment_reference',
            'amount_paid' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:completed,pending,failed',
            'document_id' => 'required|exists:documents,id',
            'remarks' => 'nullable|string',
        ]);

        $validated['status'] = $validated['status'] ?? 'completed';

        $payment = Payment::create($validated);

        return response()->json([
            'message' => 'Payment registered successfully',
            'payment' => $payment,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $payment = Payment::with(['compensation', 'document'])->find($id);

        if (! $payment) {
            return response()->json([
                'message' => 'Payment not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Payment fetched successfully',
            'payment' => $payment,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $payment = Payment::find($id);

        if (! $payment) {
            return response()->json([
                'message' => 'Payment not found',
            ], 404);
        }

        $validated = $request->validate([
            'compensation_id' => 'required|exists:compensation,id',
            'payment_reference' => 'required|string|unique:payments,payment_reference,'.$id,
            'amount_paid' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:completed,pending,failed',
            'document_id' => 'required|exists:documents,id',
            'remarks' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json([
            'message' => 'Payment updated successfully',
            'payment' => $payment,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payment = Payment::find($id);

        if (! $payment) {
            return response()->json([
                'message' => 'Payment not found',
            ], 404);
        }

        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully',
        ], 200);
    }
}
