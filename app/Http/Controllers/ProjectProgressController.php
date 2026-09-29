<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Services\ProjectProgressService;
use Exception;
use Illuminate\Http\Request;

class ProjectProgressController extends Controller
{
    protected ProjectProgressService $progressService;

    public function __construct(ProjectProgressService $progressService)
    {
        $this->progressService = $progressService;
    }

    /**
     * Get progress for an acquisition case / project.
     */
    public function show(Request $request, $projectId)
    {
        $project = Projects::where('id', $projectId)->orWhere('project_id', $projectId)->first();

        if (! $project) {
            return response()->json([
                'message' => 'Acquisition project not found.',
            ], 404);
        }

        $progress = $this->progressService->getProgress($project);

        return response()->json([
            'message' => 'Project progress fetched successfully.',
            'project_id' => $project->id,
            'progress' => $progress,
        ], 200);
    }

    /**
     * Store/Update progress for an acquisition case. DO Role Authorized Only.
     */
    public function store(Request $request, $projectId)
    {
        $user = $request->user();

        if (! $user || ! $user->role || $user->role->role_name !== 'DO') {
            return response()->json([
                'message' => 'Forbidden. Only Development Officers (DO) can mark progress.',
            ], 403);
        }

        $project = Projects::where('id', $projectId)->orWhere('project_id', $projectId)->first();

        if (! $project) {
            return response()->json([
                'message' => 'Acquisition project not found.',
            ], 404);
        }

        $validated = $request->validate([
            'stages' => 'required|array',
            'stages.*.id' => 'required',
            'stages.*.name' => 'required|string',
            'stages.*.items' => 'required|array',
        ]);

        try {
            $progress = $this->progressService->saveProgress($project, $validated['stages'], $user);

            return response()->json([
                'message' => 'Acquisition progress saved successfully.',
                'progress' => $progress,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
        }
    }
}
