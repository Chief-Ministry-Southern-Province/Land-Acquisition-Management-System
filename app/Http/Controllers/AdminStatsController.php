<?php

namespace App\Http\Controllers;

use App\Models\AuditLogs;
use App\Models\Projects;
use App\Models\User;
use App\Services\RateLimiterService;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    /**
     * Get statistics for admin dashboard.
     */
    public function index(): JsonResponse
    {
        $activeUsers = User::where('status', '!=', 'inactive')->count();
        $usersThisWeek = User::where('created_at', '>=', now()->subDays(7))->count();

        $systemLogs24h = AuditLogs::where('created_at', '>=', now()->subHours(24))->count();

        $pendingRequests = Projects::where('case_status', 'pending')->count();

        // Rate limiting statistics & active warnings
        $activeBlockedUsers = RateLimiterService::getActiveBlockedUsers();
        $rateLimitWarnings24h = AuditLogs::where('module', 'Security')
            ->where('action', 'like', '%Rate Limit%')
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        $logsRateText = $rateLimitWarnings24h > 0
            ? "{$rateLimitWarnings24h} rate warning(s)"
            : 'Normal rate';

        $recentRateLimitAlerts = AuditLogs::where('module', 'Security')
            ->where('action', 'like', '%Rate Limit%')
            ->where('created_at', '>=', now()->subHours(24))
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'name', 'action', 'detail', 'ip_address', 'created_at']);

        return response()->json([
            'message' => 'Admin stats fetched successfully',
            'stats' => [
                'active_users' => $activeUsers,
                'active_users_change' => "+{$usersThisWeek} this week",
                'system_logs_24h' => $systemLogs24h,
                'logs_rate' => $logsRateText,
                'pending_requests' => $pendingRequests,
                'pending_requests_change' => 'Needs review',
                'active_blocked_count' => count($activeBlockedUsers),
                'active_blocked_users' => $activeBlockedUsers,
                'rate_limit_warnings_24h' => $rateLimitWarnings24h,
                'rate_limit_status' => count($activeBlockedUsers) > 0 ? 'warning' : ($rateLimitWarnings24h > 0 ? 'caution' : 'normal'),
                'recent_rate_limit_alerts' => $recentRateLimitAlerts,
            ],
        ], 200);
    }
}
