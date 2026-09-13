<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * Check if the authenticated user is active.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && strtolower($user->status ?? 'active') === 'inactive') {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error' => 'forbidden',
                    'message' => 'Your account has been deactivated. Please contact an administrator.',
                ], 403);
            }

            abort(403, 'Your account has been deactivated. Please contact an administrator.');
        }

        return $next($request);
    }
}
