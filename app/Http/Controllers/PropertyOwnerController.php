<?php

namespace App\Http\Controllers;

use App\Models\PropertyOwner;
use Illuminate\Http\Request;

class PropertyOwnerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Property owners fetched successfully',
            'property_owners' => PropertyOwner::all(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'nic' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
        ]);

        $propertyOwner = PropertyOwner::create($validated);

        return response()->json([
            'message' => 'Property owner created successfully',
            'property_owner' => $propertyOwner,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $propertyOwner = PropertyOwner::find($id, ['*']);

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
        $validated = $request->validate([
            'owner_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'nic' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
        ]);

        $propertyOwner = PropertyOwner::find($id, ['*']);

        if (!$propertyOwner) {
            return response()->json([
                'message' => 'Property owner not found',
            ], 404);
        }

        $propertyOwner->update($validated);

        return response()->json([
            'message' => 'Property owner updated successfully',
            'property_owner' => $propertyOwner,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $propertyOwner = PropertyOwner::find($id, ['*']);

        if (!$propertyOwner) {
            return response()->json([
                'message' => 'Property owner not found',
            ], 404);
        }

        $propertyOwner->delete();

        return response()->json([
            'message' => 'Property owner deleted successfully',
        ], 204);
    }
}
