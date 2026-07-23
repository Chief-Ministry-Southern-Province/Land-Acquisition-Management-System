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
            'title' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'purpose' => 'required|string|max:255',
            'institution' => 'nullable|string|max:255',
            'institution_address' => 'nullable|string|max:255',
            'land_area_to_be_acquired_acers' => 'nullable|numeric',
            'land_area_to_be_acquired_roods' => 'nullable|numeric',
            'land_area_to_be_acquired_perches' => 'nullable|numeric',
            'full_land_area_to_be_acquired' => 'nullable|numeric',
            'are_residents_moved_temp' => 'nullable|boolean',
            'section20_observation' => 'nullable|boolean',
            'section21_secretary_report' => 'nullable|boolean',
            'section22_secretary_recommendation' => 'nullable|string|max:255',
            'section23_valuation_recommendation' => 'nullable|string|max:255',
            'section24_decision_remarks' => 'nullable|boolean',
            'section25_additional_conditions' => 'nullable|string|max:255',
            'section26_final_recommendation' => 'nullable|boolean',
            'approval_date' => 'nullable|date',
            'approved_by' => 'nullable|exists:users,id',
            'status' => 'required|string|in:active,pending,completed',
            'remarks' => 'nullable|string',
            'parcel_ids' => 'nullable|array',
            'parcel_ids.*' => 'exists:land_parcels,id',
        ]);

        if (empty($validated['title']) && ! empty($validated['name'])) {
            $validated['title'] = $validated['name'];
        }
        if (empty($validated['title'])) {
            $validated['title'] = 'Untitled Project';
        }
        if (! isset($validated['institution'])) {
            $validated['institution'] = $request->input('ministry') ?? ($request->input('department') ?? 'N/A');
        }
        if (! isset($validated['institution_address'])) {
            $validated['institution_address'] = 'N/A';
        }
        if (! isset($validated['land_area_to_be_acquired_acers'])) {
            $validated['land_area_to_be_acquired_acers'] = 0;
        }
        if (! isset($validated['land_area_to_be_acquired_roods'])) {
            $validated['land_area_to_be_acquired_roods'] = 0;
        }
        if (! isset($validated['land_area_to_be_acquired_perches'])) {
            $validated['land_area_to_be_acquired_perches'] = 0;
        }
        if (! isset($validated['full_land_area_to_be_acquired'])) {
            $validated['full_land_area_to_be_acquired'] = 0;
        }
        if (! isset($validated['are_residents_moved_temp'])) {
            $validated['are_residents_moved_temp'] = false;
        }

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
            'title' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'purpose' => 'required|string|max:255',
            'institution' => 'nullable|string|max:255',
            'institution_address' => 'nullable|string|max:255',
            'land_area_to_be_acquired_acers' => 'nullable|numeric',
            'land_area_to_be_acquired_roods' => 'nullable|numeric',
            'land_area_to_be_acquired_perches' => 'nullable|numeric',
            'full_land_area_to_be_acquired' => 'nullable|numeric',
            'are_residents_moved_temp' => 'nullable|boolean',
            'section20_observation' => 'nullable|boolean',
            'section21_secretary_report' => 'nullable|boolean',
            'section22_secretary_recommendation' => 'nullable|string|max:255',
            'section23_valuation_recommendation' => 'nullable|string|max:255',
            'section24_decision_remarks' => 'nullable|boolean',
            'section25_additional_conditions' => 'nullable|string|max:255',
            'section26_final_recommendation' => 'nullable|boolean',
            'approval_date' => 'nullable|date',
            'approved_by' => 'nullable|exists:users,id',
            'status' => 'required|string|in:active,pending,completed',
            'remarks' => 'nullable|string',
            'parcel_ids' => 'nullable|array',
            'parcel_ids.*' => 'exists:land_parcels,id',
        ]);

        if (empty($validated['title']) && ! empty($validated['name'])) {
            $validated['title'] = $validated['name'];
        }

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
