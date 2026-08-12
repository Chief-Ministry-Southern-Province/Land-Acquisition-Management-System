<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('locale')
            ?? $request->header('X-Locale')
            ?? (session()->has('locale') ? session('locale') : null);

        if ($locale && in_array($locale, ['en', 'si'])) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
