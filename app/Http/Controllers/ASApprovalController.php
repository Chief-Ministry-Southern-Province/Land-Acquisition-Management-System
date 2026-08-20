<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ASApprovalController extends Controller
{
    /**
     * Get all pending, approved, and rejected project cases for the Assistant Secretary.
     */
    public function index()
    {
        $projects = Projects::where(function ($query) {
            $query->where(function ($q) {
                $q->where('ao_status', 'approved')
                    ->where('as_status', 'pending');
            })
                ->orWhereIn('as_status', ['approved', 'rejected']);
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

        $project->as_status = 'approved';
        $project->sas_status = 'pending';
        // If the project moves up further or completes, we can set that here,
        // but for now, we mark AS status as approved.
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[System]: Approved by Assistant Secretary';
        $project->save();

        // Notify Senior Assistant Secretary (SAS) users
        $sasUsers = User::whereHas('role', fn ($q) => $q->where('role_name', 'SAS'))->get();
        foreach ($sasUsers as $sas) {
            $sas->notify(new RealtimeSystemNotification(
                title: 'Project Approved by AS',
                message: "Project '{$project->title}' was approved by AS and is pending your review.",
                actionUrl: '/approval-workflow',
                type: 'success'
            ));
        }

        return response()->json(['message' => 'Project approved successfully', 'project' => $project], 200);
    }

    /**
     * Reject a project case (demotes back to Head of Branch).
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

        // AS Rejection Demotion logic:
        // Sets as_status to rejected, but returns to DO by setting do_status to draft and resetting previous statuses to pending.
        $project->as_status = 'rejected';
        $project->do_status = 'draft';
        $project->hob_status = 'pending';
        $project->ao_status = 'pending';
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Rejected AS - Returned to DO]: '.$comment;
        $project->save();

        // Notify DO, HOB, and AO users
        $notifiedUsers = User::whereHas('role', fn ($q) => $q->whereIn('role_name', ['DO', 'HOB', 'AO']))->get();
        foreach ($notifiedUsers as $u) {
            $u->notify(new RealtimeSystemNotification(
                title: 'Project Rejected by AS',
                message: "Project '{$project->title}' was rejected by AS and returned to DO: {$comment}",
                actionUrl: '/dashboard',
                type: 'error'
            ));
        }

        return response()->json(['message' => 'Project rejected and returned to DO successfully', 'project' => $project], 200);
    }
}
