<?php

namespace App\Http\Middleware;

use App\Services\RateLimiterService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     * Enforces operation-based rate limits and temporary blocking.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $blockResponse = RateLimiterService::checkAndEnforce($request);

        if ($blockResponse !== null) {
            return $blockResponse;
        }

        $response = $next($request);

        return RateLimiterService::addHeaders($request, $response);
    }
}
