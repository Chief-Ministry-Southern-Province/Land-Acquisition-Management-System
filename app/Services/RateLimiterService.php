<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimiterService
{
    /**
     * Determine the operation classification of an incoming request.
     */
    public static function determineOperation(Request $request): string
    {
        $path = trim($request->path(), '/');
        $method = strtoupper($request->method());

        // 1. Login attempts
        if ($request->is('api/auth/login') || $request->is('login')) {
            return 'auth_login';
        }

        // 2. Password reset requests
        if (
            $request->is('api/auth/forgot-password') ||
            $request->is('api/auth/reset-password') ||
            $request->is('forgot-password') ||
            $request->is('reset-password*')
        ) {
            return 'auth_password_reset';
        }

        // 3. Document uploads and imports
        if (
            ($request->is('api/documents*') && $method === 'POST') ||
            $request->is('api/land-parcels/import') ||
            $request->is('api/backups/*/restore') ||
            $request->is('api/backups/restore') ||
            $request->hasFile('file') ||
            $request->hasFile('document') ||
            $request->hasFile('files')
        ) {
            return 'document_upload_import';
        }

        // 4. Report generation and exports
        if (
            $request->is('api/reports*') ||
            $request->is('*/export*') ||
            $request->is('api/land-parcels/template') ||
            ($request->is('api/backups*') && in_array($method, ['GET', 'POST']) && ! $request->is('api/backups/*/restore'))
        ) {
            return 'report_export';
        }

        // 5. Create, update, and delete records (CUD)
        if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return 'cud_records';
        }

        // 6. Search and filtering
        if ($method === 'GET' && self::hasSearchOrFilterParams($request)) {
            return 'search_filter';
        }

        // 7. General system operations (fallback)
        return 'general';
    }

    /**
     * Check if request query string contains search/filter parameters.
     */
    protected static function hasSearchOrFilterParams(Request $request): bool
    {
        $filterKeys = [
            'search', 'filter', 'q', 'query', 'status', 'type',
            'start_date', 'end_date', 'from_date', 'to_date',
            'role', 'department_id', 'project_id', 'lot_no', 'plan_no',
            'owner_name', 'nic', 'sort', 'order', 'keyword',
        ];

        foreach ($filterKeys as $key) {
            if ($request->has($key) && $request->input($key) !== null && $request->input($key) !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve the authenticated user from the request using any available guard.
     */
    public static function resolveUser(Request $request): ?User
    {
        $user = $request->user();

        if (! $user && Auth::guard('sanctum')->check()) {
            $user = Auth::guard('sanctum')->user();
        }

        if (! $user && Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();
        }

        if ($user) {
            $request->setUserResolver(fn () => $user);
        }

        return $user;
    }

    /**
     * Resolve rate limit identification key for a given request.
     * Each authenticated officer receives an independent allowance.
     */
    public static function resolveIdentifier(Request $request, string $operation, ?User $user = null): string
    {
        $user = $user ?? self::resolveUser($request);

        if ($user) {
            return "user:{$user->id}";
        }

        $ip = $request->ip() ?: '127.0.0.1';

        if ($operation === 'auth_login') {
            $login = strtolower(trim((string) $request->input('login', $request->input('email', 'guest'))));

            return "login:ip:{$ip}:{$login}";
        }

        if ($operation === 'auth_password_reset') {
            $email = strtolower(trim((string) $request->input('email', 'guest')));

            return "reset:ip:{$ip}:{$email}";
        }

        return "ip:{$ip}";
    }

    /**
     * Check if the request is from a temporarily blocked user or IP.
     * Each authenticated officer receives an independent allowance,
     * so authenticated users are checked by user ID, while guests are checked by IP.
     */
    public static function isBlocked(Request $request): ?array
    {
        $user = self::resolveUser($request);

        if ($user) {
            return self::getUserBlockInfo($user->id);
        }

        $ip = $request->ip() ?: '127.0.0.1';

        return self::getIpBlockInfo($ip);
    }

    /**
     * Check if a specific user is blocked.
     */
    public static function isUserBlocked(int|string $userId): bool
    {
        return self::getUserBlockInfo($userId) !== null;
    }

    /**
     * Check if a specific IP is blocked.
     */
    public static function isIpBlocked(string $ip): bool
    {
        return self::getIpBlockInfo($ip) !== null;
    }

    /**
     * Get block info for a user.
     */
    public static function getUserBlockInfo(int|string $userId): ?array
    {
        $info = Cache::get("rate_limit_block:user:{$userId}");

        return is_array($info) ? self::enrichBlockInfo($info) : null;
    }

    /**
     * Get block info for an IP address.
     */
    public static function getIpBlockInfo(string $ip): ?array
    {
        $info = Cache::get("rate_limit_block:ip:{$ip}");

        return is_array($info) ? self::enrichBlockInfo($info) : null;
    }

    /**
     * Retrieve all currently blocked users with their active block metadata.
     */
    public static function getActiveBlockedUsers(): array
    {
        $blocked = [];
        $users = User::all(['id', 'name', 'email']);

        foreach ($users as $user) {
            $info = self::getUserBlockInfo($user->id);
            if ($info) {
                $blocked[] = array_merge($info, [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                ]);
            }
        }

        return $blocked;
    }

    /**
     * Recalculate remaining seconds and retry after on block info.
     */
    protected static function enrichBlockInfo(array $info): array
    {
        $now = now()->getTimestamp();
        $expires = $info['expires_timestamp'] ?? $now;
        $remaining = max(1, $expires - $now);

        $info['retry_after'] = $remaining;

        return $info;
    }

    /**
     * Temporarily block a user or IP address and notify administrators.
     */
    public static function blockSubject(
        Request $request,
        ?User $user,
        string $operation,
        string $window,
        int $limit
    ): array {
        $blockMinutes = (int) (SystemSetting::get('rate_limit_block_duration_minutes', null)
            ?: config('rate_limiting.block_duration_minutes', 15));

        if ($blockMinutes < 1) {
            $blockMinutes = 15;
        }

        $now = now();
        $expiresAt = $now->copy()->addMinutes($blockMinutes);
        $opConfig = config("rate_limiting.operations.{$operation}", []);
        $opName = $opConfig['name'] ?? $operation;
        $ip = $request->ip() ?: '127.0.0.1';

        $blockData = [
            'blocked' => true,
            'blocked_at' => $now->toIso8601String(),
            'blocked_until' => $expiresAt->toIso8601String(),
            'expires_timestamp' => $expiresAt->getTimestamp(),
            'retry_after' => $blockMinutes * 60,
            'operation' => $operation,
            'operation_name' => $opName,
            'window' => $window,
            'limit' => $limit,
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'ip' => $ip,
        ];

        // Store block in Cache (user-specific for authenticated officers, IP-specific for guests)
        if ($user) {
            Cache::put("rate_limit_block:user:{$user->id}", $blockData, $expiresAt);
        } else {
            Cache::put("rate_limit_block:ip:{$ip}", $blockData, $expiresAt);
        }

        // Notify system administrators and record audit log
        self::notifyAdministrators($request, $user, $operation, $window, $limit, $blockMinutes);

        return $blockData;
    }

    /**
     * Send real-time alerts to system administrators and record audit/system log.
     */
    public static function notifyAdministrators(
        Request $request,
        ?User $user,
        string $operation,
        string $window,
        int $limit,
        int $blockMinutes
    ): void {
        $ip = $request->ip() ?: '127.0.0.1';
        $dedupKey = 'rate_limit_alert_sent:'.($user ? "user:{$user->id}" : "ip:{$ip}");

        $cooldown = (int) config('rate_limiting.alert_cooldown_minutes', 15);
        if ($cooldown < 1) {
            $cooldown = 15;
        }

        // De-duplicate notifications so admins are only alerted once per block window
        if (! Cache::add($dedupKey, true, now()->addMinutes($cooldown))) {
            return;
        }

        $opConfig = config("rate_limiting.operations.{$operation}", []);
        $opName = $opConfig['name'] ?? $operation;

        $subject = $user
            ? "Officer {$user->name} ({$user->email})"
            : "Client at IP {$ip}";

        $message = "{$subject} exceeded the {$opName} rate limit ({$limit} requests per {$window}) from IP {$ip} and has been temporarily blocked for {$blockMinutes} minutes.";

        // 1. Send RealtimeSystemNotification to active Administrators
        try {
            $admins = User::whereHas('role', function ($query) {
                $query->where('role_name', 'Admin');
            })->where(function ($query) {
                $query->whereNull('status')->orWhere('status', '!=', 'inactive');
            })->get();

            $notification = new RealtimeSystemNotification(
                title: 'Security Alert: Rate Limit Exceeded',
                message: $message,
                actionUrl: '/audit-log',
                type: 'warning',
                notificationCategory: 'security'
            );

            foreach ($admins as $admin) {
                $admin->notify($notification);
            }
        } catch (\Throwable $e) {
            Log::error("Failed to dispatch rate limit alert to administrators: {$e->getMessage()}", [
                'exception' => $e,
            ]);
        }

        // 2. Record in Audit Logs if authenticated user
        if ($user) {
            try {
                AuditLogService::log(
                    userId: $user->id,
                    name: $user->name,
                    action: 'Rate Limit Exceeded - Temporary Block',
                    module: 'Security',
                    detail: $message
                );
            } catch (\Throwable $e) {
                Log::error("Failed to write rate limit audit log: {$e->getMessage()}", [
                    'exception' => $e,
                ]);
            }
        }

        // 3. Application Security Log
        Log::warning("Rate Limiter Block: {$message}", [
            'user_id' => $user?->id,
            'ip' => $ip,
            'operation' => $operation,
            'window' => $window,
            'limit' => $limit,
            'path' => $request->path(),
        ]);
    }

    /**
     * Unblock a user by ID and reset their rate limits.
     */
    public static function unblockUser(int|string $userId): bool
    {
        $key = "rate_limit_block:user:{$userId}";
        $wasBlocked = Cache::has($key);

        Cache::forget($key);
        Cache::forget("rate_limit_alert_sent:user:{$userId}");

        self::clearUserRateLimits($userId);

        return $wasBlocked;
    }

    /**
     * Unblock an IP address.
     */
    public static function unblockIp(string $ip): bool
    {
        $key = "rate_limit_block:ip:{$ip}";
        $wasBlocked = Cache::has($key);

        Cache::forget($key);
        Cache::forget("rate_limit_alert_sent:ip:{$ip}");

        return $wasBlocked;
    }

    /**
     * Clear all rate limiting counters for a user.
     */
    public static function clearUserRateLimits(int|string $userId): void
    {
        $operations = array_keys(config('rate_limiting.operations', []));
        foreach ($operations as $op) {
            RateLimiter::clear("rate_limit:{$op}:user:{$userId}:minute");
            RateLimiter::clear("rate_limit:{$op}:user:{$userId}:hour");
        }
        RateLimiter::clear("rate_limit:general:user:{$userId}:minute");
        RateLimiter::clear("rate_limit:general:user:{$userId}:hour");
    }

    /**
     * Check if rate limiting is enabled.
     */
    public static function isEnabled(): bool
    {
        $dbSetting = SystemSetting::get('rate_limiting_enabled', null);
        if ($dbSetting !== null) {
            return filter_var($dbSetting, FILTER_VALIDATE_BOOLEAN);
        }

        return (bool) config('rate_limiting.enabled', true);
    }

    /**
     * Check incoming request against rate limits and enforce blocking if exceeded.
     * Returns a Response (429) if blocked/exceeded, or null if allowed.
     */
    public static function checkAndEnforce(Request $request): ?Response
    {
        if (! self::isEnabled()) {
            return null;
        }

        // Check if subject is already temporarily blocked
        $blockInfo = self::isBlocked($request);
        if ($blockInfo) {
            return self::buildBlockedResponse($blockInfo, $request);
        }

        $user = self::resolveUser($request);
        $operation = self::determineOperation($request);
        $identifier = self::resolveIdentifier($request, $operation, $user);

        $opConfig = config("rate_limiting.operations.{$operation}", []);
        $opMaxMinute = (int) ($opConfig['per_minute'] ?? 120);
        $opMaxHour = (int) ($opConfig['per_hour'] ?? 2000);

        // General API limit thresholds (120/min, 2000/hr)
        $genConfig = config('rate_limiting.operations.general', []);
        $genMaxMinute = (int) ($genConfig['per_minute'] ?? 120);
        $genMaxHour = (int) ($genConfig['per_hour'] ?? 2000);

        $limitsToCheck = [
            [
                'operation' => $operation,
                'window' => 'minute',
                'key' => "rate_limit:{$operation}:{$identifier}:minute",
                'max' => $opMaxMinute,
                'decay' => 60,
            ],
            [
                'operation' => $operation,
                'window' => 'hour',
                'key' => "rate_limit:{$operation}:{$identifier}:hour",
                'max' => $opMaxHour,
                'decay' => 3600,
            ],
        ];

        // Also check overarching general API limit if operation is not already general
        if ($operation !== 'general') {
            $genIdentifier = self::resolveIdentifier($request, 'general', $user);
            $limitsToCheck[] = [
                'operation' => 'general',
                'window' => 'minute',
                'key' => "rate_limit:general:{$genIdentifier}:minute",
                'max' => $genMaxMinute,
                'decay' => 60,
            ];
            $limitsToCheck[] = [
                'operation' => 'general',
                'window' => 'hour',
                'key' => "rate_limit:general:{$genIdentifier}:hour",
                'max' => $genMaxHour,
                'decay' => 3600,
            ];
        }

        // 1. Verify if any limit is exceeded
        foreach ($limitsToCheck as $limit) {
            if (RateLimiter::tooManyAttempts($limit['key'], $limit['max'])) {
                $blockData = self::blockSubject(
                    $request,
                    $user,
                    $limit['operation'],
                    $limit['window'],
                    $limit['max']
                );

                return self::buildBlockedResponse($blockData, $request);
            }
        }

        // 2. Increment counters
        foreach ($limitsToCheck as $limit) {
            RateLimiter::hit($limit['key'], $limit['decay']);
        }

        // Save active operation key in request attributes for response headers
        $request->attributes->set('rate_limit_op_key', "rate_limit:{$operation}:{$identifier}:minute");
        $request->attributes->set('rate_limit_op_max', $opMaxMinute);

        return null;
    }

    /**
     * Build the 429 Too Many Requests response with standard retry headers.
     */
    public static function buildBlockedResponse(array $blockInfo, Request $request): Response
    {
        $retryAfter = $blockInfo['retry_after'] ?? 60;
        $minutesLeft = (int) ceil($retryAfter / 60);
        $timeString = $minutesLeft > 1 ? "{$minutesLeft} minutes" : "{$retryAfter} seconds";

        $opName = $blockInfo['operation_name']
            ?? (config("rate_limiting.operations.{$blockInfo['operation']}.name") ?? 'system operations');

        $message = "Too many requests. Your activities have been temporarily blocked due to exceeding allowed limits for {$opName}. Please try again in {$timeString}.";

        $headers = [
            'Retry-After' => $retryAfter,
            'X-RateLimit-Reset' => $blockInfo['expires_timestamp'] ?? now()->addSeconds($retryAfter)->getTimestamp(),
            'X-RateLimit-Blocked' => 'true',
        ];

        if ($request->expectsJson() || $request->is('api/*')) {
            return new JsonResponse([
                'error' => 'rate_limit_exceeded',
                'message' => $message,
                'blocked' => true,
                'operation' => $opName,
                'retry_after' => $retryAfter,
                'blocked_until' => $blockInfo['blocked_until'] ?? null,
            ], 429, $headers);
        }

        return response($message, 429, $headers);
    }

    /**
     * Add rate limiting headers to passing response.
     */
    public static function addHeaders(Request $request, Response $response): Response
    {
        $opKey = $request->attributes->get('rate_limit_op_key');
        $opMax = $request->attributes->get('rate_limit_op_max');

        if ($opKey && $opMax) {
            $remaining = RateLimiter::remaining($opKey, $opMax);
            $availableIn = RateLimiter::availableIn($opKey);

            $response->headers->set('X-RateLimit-Limit', (string) $opMax);
            $response->headers->set('X-RateLimit-Remaining', (string) max(0, $remaining));
            $response->headers->set('X-RateLimit-Reset', (string) (now()->getTimestamp() + $availableIn));
        }

        return $response;
    }
}
