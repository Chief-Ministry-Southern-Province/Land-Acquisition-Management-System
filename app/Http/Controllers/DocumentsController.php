<?php

namespace App\Http\Controllers;

use App\Models\Documents;
use Illuminate\Http\Request;

class DocumentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Documents fetched successfully',
            'documents' => Documents::all(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'size' => 'required|string|max:255',
            'upload_date' => 'required|date',
            'document_type' => 'required|string|max:255',
            'link' => 'required|string|max:255',
        ]);

        $document = Documents::create($validated);

        return response()->json([
            'message' => 'Document created successfully',
            'document' => $document,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $document = Documents::find($id, ['*']);

        if ($document) {
            return response()->json([
                'message' => 'Document fetched successfully',
                'document' => $document,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'size' => 'required|string|max:255',
            'upload_date' => 'required|date',
            'document_type' => 'required|string|max:255',
            'link' => 'required|string|max:255',
        ]);

        $document = Documents::find($id, ['*']);

        if (!$document) {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }

        $document->update($validated);

        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $document = Documents::find($id, ['*']);

        if (!$document) {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }

        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ], 204);
    }
}
