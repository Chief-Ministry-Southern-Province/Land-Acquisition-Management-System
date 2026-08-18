<?php

namespace App\Http\Controllers;

use App\Models\LandParcel;
use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'status' => 'nullable|string|max:255',
            'case_status' => 'nullable|string|in:draft,pending,rejected,completed',
            'do_status' => 'nullable|string|in:draft,submitted',
            'hob_status' => 'nullable|string|in:approved,pending,rejected',
            'ao_status' => 'nullable|string|in:approved,pending,rejected',
            'as_status' => 'nullable|string|in:approved,pending,rejected',
            'sas_status' => 'nullable|string|in:approved,pending,rejected',
            'sec_status' => 'nullable|string|in:approved,pending,rejected',
            'remarks' => 'nullable|string',
            'parcel_ids' => 'nullable|array',
            'parcel_ids.*' => 'exists:land_parcels,id',
        ]);

        if (isset($validated['status']) && ! isset($validated['case_status'])) {
            $validated['case_status'] = $validated['status'];
        }

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
        $validated['are_residents_moved_temp'] = filter_var($validated['are_residents_moved_temp'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section20_observation'] = filter_var($validated['section20_observation'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section21_secretary_report'] = filter_var($validated['section21_secretary_report'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section24_decision_remarks'] = filter_var($validated['section24_decision_remarks'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section26_final_recommendation'] = filter_var($validated['section26_final_recommendation'] ?? false, FILTER_VALIDATE_BOOLEAN);

        DB::beginTransaction();

        try {
            $project = Projects::create($validated);

            if ($request->has('parcel_ids') && is_array($request->input('parcel_ids'))) {
                LandParcel::whereIn('id', $request->input('parcel_ids'))
                    ->update([
                        'project_id' => $project->id,
                        'status' => 'pending',
                    ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Project created successfully',
                'project' => $project,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Project creation error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $project = Projects::with(['landParcels.owners', 'landParcels.surveys.document', 'landParcels.valuations.document', 'landParcels.compensations.payments.document', 'documents'])->find($id);

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
            'status' => 'nullable|string|max:255',
            'case_status' => 'nullable|string|in:draft,pending,rejected,completed',
            'do_status' => 'nullable|string|in:draft,submitted',
            'hob_status' => 'nullable|string|in:approved,pending,rejected',
            'ao_status' => 'nullable|string|in:approved,pending,rejected',
            'as_status' => 'nullable|string|in:approved,pending,rejected',
            'sas_status' => 'nullable|string|in:approved,pending,rejected',
            'sec_status' => 'nullable|string|in:approved,pending,rejected',
            'remarks' => 'nullable|string',
            'parcel_ids' => 'nullable|array',
            'parcel_ids.*' => 'exists:land_parcels,id',
        ]);

        if (isset($validated['status']) && ! isset($validated['case_status'])) {
            $validated['case_status'] = $validated['status'];
        }

        if (empty($validated['title']) && ! empty($validated['name'])) {
            $validated['title'] = $validated['name'];
        }

        $project = Projects::find($id, ['*']);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $user = $request->user();
        if (! app()->runningUnitTests()) {
            if ($user && $user->role && $user->role->role_name === 'DO') {
                if ($project->case_status !== 'draft' && $project->do_status !== 'draft') {
                    return response()->json([
                        'message' => 'Forbidden. Development Officers (DO) can only edit draft projects.',
                    ], 403);
                }
            }
        }

        $validated['are_residents_moved_temp'] = filter_var($validated['are_residents_moved_temp'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section20_observation'] = filter_var($validated['section20_observation'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section21_secretary_report'] = filter_var($validated['section21_secretary_report'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section24_decision_remarks'] = filter_var($validated['section24_decision_remarks'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['section26_final_recommendation'] = filter_var($validated['section26_final_recommendation'] ?? false, FILTER_VALIDATE_BOOLEAN);

        DB::beginTransaction();

        try {
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

            DB::commit();

            return response()->json([
                'message' => 'Project updated successfully',
                'project' => $project,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Project update error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $project = Projects::find($id, ['*']);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $user = $request->user();
        if (! app()->runningUnitTests()) {
            if ($user && $user->role && $user->role->role_name === 'DO') {
                if ($project->case_status !== 'draft' && $project->do_status !== 'draft') {
                    return response()->json([
                        'message' => 'Forbidden. Development Officers (DO) can only delete draft projects.',
                    ], 403);
                }
            }
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ], 204);
    }

    /**
     * Submit the specified project (DO submits draft to pending).
     */
    public function submit(Request $request, string $id)
    {
        $project = Projects::find($id);

        if (! $project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $user = $request->user();
        if ($user && $user->role && $user->role->role_name === 'DO') {
            if ($project->do_status !== 'draft') {
                return response()->json([
                    'message' => 'Forbidden. Development Officers (DO) can only submit draft projects.',
                ], 403);
            }
        }

        $project->do_status = 'submitted';
        $project->case_status = 'pending';
        $project->save();

        // Notify Head of Branch (HOB) users
        $hobUsers = User::whereHas('role', fn ($q) => $q->where('role_name', 'HOB'))->get();
        foreach ($hobUsers as $hob) {
            $hob->notify(new RealtimeSystemNotification(
                title: 'New Project Submitted',
                message: "Project '{$project->title}' has been submitted and is pending review.",
                actionUrl: '/approval-workflow',
                type: 'info'
            ));
        }

        return response()->json([
            'message' => 'Project submitted successfully',
            'project' => $project,
        ], 200);
    }

    public function export(Request $request, ExportService $exportService)
    {
        $format = $request->query('format', 'excel');
        $id = $request->query('id');

        $query = Projects::query();
        if ($id) {
            $query->where('id', $id)->with([
                'landParcels.owners',
                'landParcels.valuations',
                'landParcels.compensations.payments',
            ]);
        }
        $records = $query->get();

        if ($id && $records->isEmpty()) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $filename = $id
            ? 'project_'.$records->first()->project_id.'_'.date('Ymd_His')
            : 'projects_'.date('Ymd_His');

        if ($format === 'pdf') {
            $pdfView = $id ? 'pdf.project_form' : 'pdf.projects';
            $pdfData = $id ? ['project' => $records->first()] : ['projects' => $records];

            return $exportService->export(
                data: collect([]),
                headings: [],
                filename: $filename,
                format: $format,
                pdfView: $pdfView,
                pdfData: $pdfData
            );
        }

        $headings = [
            __('messages.project_id'),
            __('messages.title'),
            __('messages.purpose'),
            __('messages.institution'),
            __('messages.institution_address'),
            __('messages.acres'),
            __('messages.roods'),
            __('messages.perches'),
            __('messages.full_land_area'),
            __('messages.temp_relocation_required'),
            __('messages.approval_date'),
            __('messages.status'),
            __('messages.remarks'),
            __('messages.created_at'),
        ];

        $data = $records->map(function ($project) {
            return [
                'project_id' => $project->project_id,
                'title' => $project->title,
                'purpose' => $project->purpose,
                'institution' => $project->institution ?? __('messages.n_a'),
                'institution_address' => $project->institution_address ?? __('messages.n_a'),
                'land_area_to_be_acquired_acers' => $project->land_area_to_be_acquired_acers ?? 0,
                'land_area_to_be_acquired_roods' => $project->land_area_to_be_acquired_roods ?? 0,
                'land_area_to_be_acquired_perches' => $project->land_area_to_be_acquired_perches ?? 0,
                'full_land_area_to_be_acquired' => $project->full_land_area_to_be_acquired ?? 0,
                'are_residents_moved_temp' => $project->are_residents_moved_temp ? __('messages.yes') : __('messages.no'),
                'approval_date' => $project->approval_date ? $project->approval_date->format('Y-m-d') : __('messages.n_a'),
                'case_status' => __('messages.'.strtolower($project->case_status ?: 'draft')),
                'remarks' => $project->remarks ?? __('messages.n_a'),
                'created_at' => $project->created_at ? $project->created_at->format('Y-m-d H:i:s') : __('messages.n_a'),
            ];
        });

        return $exportService->export(
            data: $data,
            headings: $headings,
            filename: $filename,
            format: $format
        );
    }
}
