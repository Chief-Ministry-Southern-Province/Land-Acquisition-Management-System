<?php

namespace App\Http\Controllers;

use App\Models\Documents;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || ! $user->role || ! in_array($user->role->role_name, ['DO', 'HOB', 'AO', 'AS', 'SAS', 'SEC'])) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ], 403);
        }

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
        $user = $request->user();
        if (! $user || ! $user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can perform this action.',
            ], 403);
        }

        if ($request->hasFile('file')) {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'project_id' => 'nullable|exists:projects,id',
                'land_parcel_id' => 'nullable|exists:land_parcels,id',
                'property_owner_id' => 'nullable|exists:property_owners,id',
                'document_category' => 'required|string|max:255',
                'file' => 'required|file|max:10240', // 10MB max
            ]);

            $fileUploadService = new FileUploadService;
            $storagePath = ($validated['project_id'] ?? null)
                ? 'projects/'.$validated['project_id']
                : 'general';
            $uploadResult = $fileUploadService->upload(
                $request->file('file'),
                'acquisition_case_documents',
                $storagePath
            );

            // Extension is retrieved from the uploaded file
            $extension = '.'.strtolower($request->file('file')->guessExtension() ?? $request->file('file')->getClientOriginalExtension());
            $fileSize = $this->formatBytes($uploadResult['file_size']);

            $document = Documents::create([
                'user_id' => $validated['user_id'],
                'project_id' => $validated['project_id'] ?? null,
                'land_parcel_id' => $validated['land_parcel_id'] ?? null,
                'property_owner_id' => $validated['property_owner_id'] ?? null,
                'original_filename' => $uploadResult['original_filename'],
                'stored_filename' => $uploadResult['stored_filename'],
                'file_type' => $extension,
                'file_path' => $uploadResult['file_path'],
                'file_size' => $fileSize,
                'document_category' => $validated['document_category'],
                'upload_date' => now()->toDateString(),
            ]);
        } else {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'project_id' => 'nullable|exists:projects,id',
                'land_parcel_id' => 'nullable|exists:land_parcels,id',
                'property_owner_id' => 'nullable|exists:property_owners,id',
                'original_filename' => 'required|string|max:255',
                'stored_filename' => 'required|string|max:255',
                'file_type' => 'required|string|max:255',
                'file_path' => 'required|string|max:255',
                'file_size' => 'required|string|max:255',
                'document_category' => 'required|string|max:255',
                'upload_date' => 'required|date',
            ]);

            $document = Documents::create($validated);
        }

        return response()->json([
            'message' => 'Document created successfully',
            'document' => $document,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user || ! $user->role || ! in_array($user->role->role_name, ['DO', 'HOB', 'AO', 'AS', 'SAS', 'SEC'])) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ], 403);
        }

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
        $user = $request->user();
        if (! $user || ! $user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can perform this action.',
            ], 403);
        }

        $document = Documents::find($id, ['*']);

        if (! $document) {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }

        if ($request->hasFile('file')) {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'project_id' => 'required|exists:projects,id',
                'document_category' => 'required|string|max:255',
                'file' => 'required|file|max:10240', // 10MB max
            ]);

            $fileUploadService = new FileUploadService;

            // Delete old file if it exists
            $fileUploadService->delete('acquisition_case_documents', $document->file_path);

            $uploadResult = $fileUploadService->upload(
                $request->file('file'),
                'acquisition_case_documents',
                'projects/'.$validated['project_id']
            );

            $extension = '.'.strtolower($request->file('file')->guessExtension() ?? $request->file('file')->getClientOriginalExtension());
            $fileSize = $this->formatBytes($uploadResult['file_size']);

            $document->update([
                'user_id' => $validated['user_id'],
                'project_id' => $validated['project_id'],
                'original_filename' => $uploadResult['original_filename'],
                'stored_filename' => $uploadResult['stored_filename'],
                'file_type' => $extension,
                'file_path' => $uploadResult['file_path'],
                'file_size' => $fileSize,
                'document_category' => $validated['document_category'],
                'upload_date' => now()->toDateString(),
            ]);
        } else {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'project_id' => 'required|exists:projects,id',
                'original_filename' => 'required|string|max:255',
                'stored_filename' => 'required|string|max:255',
                'file_type' => 'required|string|max:255',
                'file_path' => 'required|string|max:255',
                'file_size' => 'required|string|max:255',
                'document_category' => 'required|string|max:255',
                'upload_date' => 'required|date',
            ]);

            $document->update($validated);
        }

        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user || ! $user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can perform this action.',
            ], 403);
        }

        $document = Documents::find($id, ['*']);

        if (! $document) {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }

        // Delete file from storage if it exists
        $fileUploadService = new FileUploadService;
        $fileUploadService->delete('acquisition_case_documents', $document->file_path);

        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully',
        ], 204);
    }

    /**
     * Download the document file from storage.
     */
    public function download(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user || ! $user->role || ! in_array($user->role->role_name, ['DO', 'HOB', 'AO', 'AS', 'SAS', 'SEC'])) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ], 403);
        }

        $document = Documents::find($id);

        if (! $document) {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }

        if (! Storage::disk('acquisition_case_documents')->exists($document->file_path)) {
            return response()->json([
                'message' => 'File not found on storage disk',
            ], 404);
        }

        return Storage::disk('acquisition_case_documents')->download(
            $document->file_path,
            $document->original_filename
        );
    }

    /**
     * Helper to format bytes to human-readable size.
     */
    private function formatBytes($bytes, $precision = 1)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }
}
