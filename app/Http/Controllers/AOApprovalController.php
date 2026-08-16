<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AOApprovalController extends Controller
{
    /**
     * Get all pending, approved, and rejected project cases for the Administrative Officer.
     */
    public function index()
    {
        $projects = Projects::where(function ($query) {
            $query->where(function ($q) {
                $q->where('hob_status', 'approved')
                    ->where('ao_status', 'pending');
            })
                ->orWhereIn('ao_status', ['approved', 'rejected']);
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

        $project->ao_status = 'approved';
        $project->as_status = 'pending'; // Moves to Assistant Secretary review
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[System]: Approved by Administrative Officer';
        $project->save();

        // Notify Assistant Secretary (AS) users
        $asUsers = User::whereHas('role', fn($q) => $q->where('role_name', 'AS'))->get();
        foreach ($asUsers as $as) {
            $as->notify(new RealtimeSystemNotification(
                title: 'Project Approved by AO',
                message: "Project '{$project->title}' was approved by AO and is pending your review.",
                actionUrl: '/approval-workflow',
                type: 'success'
            ));
        }

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
        $project->hob_status = 'pending'; // Reset HOB status so they verify again
        $project->ao_status = 'pending';  // Reset AO status
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Query AO]: '.$comment;
        $project->save();

        // Notify DO and HOB users
        $notifiedUsers = User::whereHas('role', fn($q) => $q->whereIn('role_name', ['DO', 'HOB']))->get();
        foreach ($notifiedUsers as $u) {
            $u->notify(new RealtimeSystemNotification(
                title: 'Project Queried by AO',
                message: "Project '{$project->title}' was returned by AO: {$comment}",
                actionUrl: '/dashboard',
                type: 'warning'
            ));
        }

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
        $project->ao_status = 'rejected';
        $project->case_status = 'rejected'; // Halts request completely
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Rejected AO]: '.$comment;
        $project->save();

        // Notify DO and HOB users
        $notifiedUsers = User::whereHas('role', fn($q) => $q->whereIn('role_name', ['DO', 'HOB']))->get();
        foreach ($notifiedUsers as $u) {
            $u->notify(new RealtimeSystemNotification(
                title: 'Project Rejected by AO',
                message: "Project '{$project->title}' was rejected by AO: {$comment}",
                actionUrl: '/dashboard',
                type: 'error'
            ));
        }

        return response()->json(['message' => 'Project rejected successfully', 'project' => $project], 200);
    }
}
