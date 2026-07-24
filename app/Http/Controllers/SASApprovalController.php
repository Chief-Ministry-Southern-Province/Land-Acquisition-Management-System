<?php

namespace App\Http\Controllers;

use App\Models\Projects;
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
            $project->case_status = 'active'; // Marks the project case as active (fully approved)
            $project->sec_status = 'approved'; // Mark Secretary status as approved/bypassed
            $project->remarks = ($project->remarks ? $project->remarks."\n" : '').
                '[System]: Approved by Senior Assistant Secretary. Total value ('.
                number_format($totalEstimatedValue, 2).' LKR) within 20M LKR threshold. Case fully approved.';
        }

        $project->save();

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

        return response()->json(['message' => 'Project rejected and returned to DO successfully', 'project' => $project], 200);
    }
}
