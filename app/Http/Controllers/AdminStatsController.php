<?php

namespace App\Http\Controllers;

use App\Models\AuditLogs;
use App\Models\Projects;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    /**
     * Get statistics for admin dashboard.
     */
    public function index(): JsonResponse
    {
        $activeUsers = User::count();
        $usersThisWeek = User::where('created_at', '>=', now()->subDays(7))->count();

        $systemLogs24h = AuditLogs::where('created_at', '>=', now()->subHours(24))->count();

        $pendingRequests = Projects::where('case_status', 'pending')->count();

        return response()->json([
            'message' => 'Admin stats fetched successfully',
            'stats' => [
                'active_users' => $activeUsers,
                'active_users_change' => "+{$usersThisWeek} this week",
                'system_logs_24h' => $systemLogs24h,
                'logs_rate' => 'Normal rate',
                'pending_requests' => $pendingRequests,
                'pending_requests_change' => 'Needs review',
            ],
        ], 200);
    }
}
