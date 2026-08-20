<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SECApprovalController extends Controller
{
    /**
     * Get all pending, approved, and rejected project cases for the Secretary.
     */
    public function index()
    {
        $projects = Projects::where(function ($query) {
            $query->where(function ($q) {
                $q->where('sas_status', 'approved')
                    ->where('sec_status', 'pending');
            })
                ->orWhereIn('sec_status', ['approved', 'rejected']);
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

        $project->sec_status = 'approved';
        $project->case_status = 'completed'; // Marks the project case as completed (fully approved)
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[System]: Approved by Secretary';
        $project->save();

        // Notify DO, HOB, AO, AS, and SAS users
        $notifiedUsers = User::whereHas('role', fn ($q) => $q->whereIn('role_name', ['DO', 'HOB', 'AO', 'AS', 'SAS']))->get();
        foreach ($notifiedUsers as $u) {
            $u->notify(new RealtimeSystemNotification(
                title: 'Project Fully Approved (Secretary)',
                message: "Project '{$project->title}' was approved by Secretary. Case completed.",
                actionUrl: '/land-parcels',
                type: 'success'
            ));
        }

        return response()->json(['message' => 'Project approved successfully', 'project' => $project], 200);
    }

    /**
     * Reject a project case (demotes back to Senior Assistant Secretary).
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

        // SEC Rejection Demotion logic:
        // Sets sec_status to rejected, but returns to DO by setting do_status to draft and resetting previous statuses to pending.
        $project->sec_status = 'rejected';
        $project->do_status = 'draft';
        $project->hob_status = 'pending';
        $project->ao_status = 'pending';
        $project->as_status = 'pending';
        $project->sas_status = 'pending';
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Rejected SEC - Returned to DO]: '.$comment;
        $project->save();

        // Notify DO, HOB, AO, AS, and SAS users
        $notifiedUsers = User::whereHas('role', fn ($q) => $q->whereIn('role_name', ['DO', 'HOB', 'AO', 'AS', 'SAS']))->get();
        foreach ($notifiedUsers as $u) {
            $u->notify(new RealtimeSystemNotification(
                title: 'Project Rejected by Secretary',
                message: "Project '{$project->title}' was rejected by Secretary and returned to DO: {$comment}",
                actionUrl: '/dashboard',
                type: 'error'
            ));
        }

        return response()->json(['message' => 'Project rejected and returned to DO successfully', 'project' => $project], 200);
    }
}
