<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Web routes that should remain accessible during maintenance mode.
     *
     * @var array<string>
     */
    protected array $exceptWeb = [
        'maintenance',
        'login',
        'forgot-password',
        'reset-password/*',
        'lang/*',
        'up',
        '_boost/*',
        'sanctum/csrf-cookie',
    ];

    /**
     * API routes that should remain accessible during maintenance mode.
     *
     * @var array<string>
     */
    protected array $exceptApi = [
        'api/auth/login',
        'api/auth/logout',
        'api/test',
        'up',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isMaintenance = (bool) SystemSetting::get('maintenance_mode', false);

        if (! $isMaintenance) {
            return $next($request);
        }

        // Always allow the root login screen URL
        if ($request->is('/') || $request->path() === '/') {
            return $next($request);
        }

        $user = $request->user();

        // 1. Administrators have full bypass access
        if ($user && $user->role && $user->role->role_name === 'Admin') {
            return $next($request);
        }

        // 2. Handle API requests
        if ($request->expectsJson() || $request->is('api/*')) {
            foreach ($this->exceptApi as $pattern) {
                if ($request->is($pattern)) {
                    return $next($request);
                }
            }

            return response()->json([
                'error' => 'maintenance_mode',
                'message' => 'The system is currently undergoing scheduled maintenance. Access is restricted to system administrators.',
                'maintenance' => true,
            ], 503);
        }

        // 3. Handle Web requests
        foreach ($this->exceptWeb as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        return redirect()->route('maintenance');
    }
}
