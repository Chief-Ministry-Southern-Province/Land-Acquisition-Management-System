<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SASApprovalController extends Controller
{
    /**
     * Get all pending, approved, and rejected project cases for the Senior Assistant Secretary.
     */
    public function index()
    {
        $projects = Projects::where(function ($query) {
            $query->where(function ($q) {
                $q->where('as_status', 'approved')
                    ->where('sas_status', 'pending');
            })
                ->orWhereIn('sas_status', ['approved', 'rejected']);
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

        $project = Projects::with('landParcels')->find($id);
        if (! $project) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        $project->sas_status = 'approved';

        // Calculate the total estimated value of land parcels
        $totalEstimatedValue = $project->landParcels->sum('estimated_value');
        $threshold = 20000000; // 20 Million LKR

        if ($totalEstimatedValue > $threshold) {
            $project->sec_status = 'pending'; // Escalate to Secretary
            $project->remarks = ($project->remarks ? $project->remarks."\n" : '').
                '[System]: Approved by Senior Assistant Secretary. Total value ('.
                number_format($totalEstimatedValue, 2).' LKR) exceeds 20M LKR threshold. Escalated to Secretary for final approval.';
        } else {
            $project->case_status = 'completed'; // Marks the project case as completed (fully approved)
            $project->sec_status = 'approved'; // Mark Secretary status as approved/bypassed
            $project->remarks = ($project->remarks ? $project->remarks."\n" : '').
                '[System]: Approved by Senior Assistant Secretary. Total value ('.
                number_format($totalEstimatedValue, 2).' LKR) within 20M LKR threshold. Case fully approved.';
        }

        $project->save();

        if ($project->sec_status === 'pending') {
            // Escalated to Secretary - notify SEC users
            $secUsers = User::whereHas('role', fn($q) => $q->where('role_name', 'SEC'))->get();
            foreach ($secUsers as $sec) {
                $sec->notify(new RealtimeSystemNotification(
                    title: 'Escalated Project Approval Request',
                    message: "Project '{$project->title}' exceeds 20M LKR and is escalated to you for final approval.",
                    actionUrl: '/approval-workflow',
                    type: 'warning'
                ));
            }
        } else {
            // Case completed - notify DO, HOB, AO, AS
            $notifiedUsers = User::whereHas('role', fn($q) => $q->whereIn('role_name', ['DO', 'HOB', 'AO', 'AS']))->get();
            foreach ($notifiedUsers as $u) {
                $u->notify(new RealtimeSystemNotification(
                    title: 'Project Fully Approved',
                    message: "Project '{$project->title}' has been fully approved by SAS.",
                    actionUrl: "/land-parcels",
                    type: 'success'
                ));
            }
        }

        return response()->json(['message' => 'Project approved successfully', 'project' => $project], 200);
    }

    /**
     * Reject a project case (demotes back to Assistant Secretary).
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

        // SAS Rejection Demotion logic:
        // Sets sas_status to rejected, but returns to DO by setting do_status to draft and resetting previous statuses to pending.
        $project->sas_status = 'rejected';
        $project->do_status = 'draft';
        $project->hob_status = 'pending';
        $project->ao_status = 'pending';
        $project->as_status = 'pending';
        $project->remarks = ($project->remarks ? $project->remarks."\n" : '').'[Rejected SAS - Returned to DO]: '.$comment;
        $project->save();

        // Notify DO, HOB, AO, and AS users
        $notifiedUsers = User::whereHas('role', fn($q) => $q->whereIn('role_name', ['DO', 'HOB', 'AO', 'AS']))->get();
        foreach ($notifiedUsers as $u) {
            $u->notify(new RealtimeSystemNotification(
                title: 'Project Rejected by SAS',
                message: "Project '{$project->title}' was rejected by SAS and returned to DO: {$comment}",
                actionUrl: '/dashboard',
                type: 'error'
            ));
        }

        return response()->json(['message' => 'Project rejected and returned to DO successfully', 'project' => $project], 200);
    }
}
