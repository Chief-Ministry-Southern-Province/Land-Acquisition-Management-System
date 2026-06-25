<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Check if the authenticated user has one of the allowed roles.
     * Usage: middleware('check.role:Admin,SuperAdmin')
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Allowed role names
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->role) {
            return response()->json([
                'message' => 'Unauthorized. User role not found.',
            ], 403);
        }

        if (!in_array($user->role->role_name, $roles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have the required role to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
