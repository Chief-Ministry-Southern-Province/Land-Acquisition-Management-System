<?php

namespace App\Http\Controllers;

use App\Models\LandParcel;
use App\Models\Projects;
use Illuminate\Http\Request;

class ProjectsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Projects fetched successfully',
            'projects' => Projects::all(),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'ministry' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'project_type' => 'required|string|max:255',
            'acquisition_act' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'required|string|max:255',
            'purpose' => 'required|string|max:255',
            'start_date' => 'required|date',
            'estimated_completion' => 'required|date',
            'budget_im_mn' => 'required|numeric',
            'status' => 'required|string|in:active,pending,completed',
            'project_manager' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'remarks' => 'nullable|string',
            'parcel_ids' => 'nullable|array',
            'parcel_ids.*' => 'exists:land_parcels,id',
        ]);

        $project = Projects::create($validated);

        if ($request->has('parcel_ids') && is_array($request->input('parcel_ids'))) {
            LandParcel::whereIn('id', $request->input('parcel_ids'))
                ->update([
                    'project_id' => $project->id,
                    'status' => 'pending',
                ]);
        }

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $project = Projects::with(['landParcels.owners', 'documents'])->find($id);

        if ($project) {
            return response()->json([
                'message' => 'Project fetched successfully',
                'project' => $project,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'project_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'ministry' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'project_type' => 'required|string|max:255',
            'acquisition_act' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'division' => 'required|string|max:255',
            'purpose' => 'required|string|max:255',
            'start_date' => 'required|date',
            'estimated_completion' => 'required|date',
            'budget_im_mn' => 'required|numeric',
            'status' => 'required|string|in:active,pending,completed',
            'project_manager' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'remarks' => 'nullable|string',
            'parcel_ids' => 'nullable|array',
            'parcel_ids.*' => 'exists:land_parcels,id',
        ]);

        $project = Projects::find($id, ['*']);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $project->update($validated);

        if ($request->has('parcel_ids') && is_array($request->input('parcel_ids'))) {
            $newParcelIds = $request->input('parcel_ids');

            // Dissociate old parcels that are not in the new list
            LandParcel::where('project_id', $project->id)
                ->whereNotIn('id', $newParcelIds)
                ->update([
                    'project_id' => null,
                    'status' => 'available',
                ]);

            // Associate new parcels that were not already associated with this project
            LandParcel::whereIn('id', $newParcelIds)
                ->where(function ($query) use ($project) {
                    $query->where('project_id', '!=', $project->id)
                        ->orWhereNull('project_id');
                })
                ->update([
                    'project_id' => $project->id,
                    'status' => 'pending',
                ]);
        }

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $project = Projects::find($id, ['*']);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ], 204);
    }
}
