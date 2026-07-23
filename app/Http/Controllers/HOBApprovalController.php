<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HOBApprovalController extends Controller
{
    /**
     * Get all pending, approved, and rejected project cases for the Head of Branch.
     */
    public function index()
    {
        $projects = Projects::where(function ($query) {
            $query->where('do_status', 'submitted')
                ->orWhereIn('hob_status', ['approved', 'rejected']);
        })
            ->with(['landParcels', 'documents'])
            ->get();

        return response()->json([
            'message' => 'Pending approvals fetched successfully',
            'projects' => $projects,
        ], 200);
    }

    /**
     * Approve a pending project case.
     */
    public function approve(Request $request, string $type, string $id)
    {
        $userId = Auth::id();

        if ($type !== 'project') {
            return response()->json(['message' => 'Invalid approval type'], 400);
        }

        $project = Projects::find($id);
        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $project->hob_status = 'approved';
        $project->ao_status = 'pending'; // Moves to Administrative Officer review
        $project->approval_date = now();
        $project->approved_by = $userId;
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[System]: Approved by Head of Branch';
        $project->save();

        return response()->json(['message' => 'Project approved successfully', 'project' => $project], 200);
    }

    /**
     * Query a project case (return to DO for corrections).
     */
    public function query(Request $request, string $type, string $id)
    {
        $request->validate([
            'comment' => 'required|string|min:3',
        ]);

        if ($type !== 'project') {
            return response()->json(['message' => 'Invalid type'], 400);
        }

        $project = Projects::find($id);
        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $comment = $request->input('comment');
        $project->do_status = 'draft'; // Returns to DO workspace
        $project->hob_status = 'pending';
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Query HOB]: '.$comment;
        $project->save();

        return response()->json(['message' => 'Project queried successfully', 'project' => $project], 200);
    }

    /**
     * Reject a project case.
     */
    public function reject(Request $request, string $type, string $id)
    {
        $request->validate([
            'comment' => 'required|string|min:3',
        ]);

        if ($type !== 'project') {
            return response()->json(['message' => 'Invalid type'], 400);
        }

        $project = Projects::find($id);
        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $comment = $request->input('comment');
        $project->hob_status = 'rejected';
        $project->case_status = 'rejected'; // Halts request
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Rejected HOB]: '.$comment;
        $project->save();

        return response()->json(['message' => 'Project rejected successfully', 'project' => $project], 200);
    }
}
