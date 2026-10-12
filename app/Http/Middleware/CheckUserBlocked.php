<?php

namespace App\Http\Middleware;

use App\Services\RateLimiterService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserBlocked
{
    /**
     * Handle an incoming web request.
     * Checks if the user or IP is currently under a temporary rate-limit block.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! RateLimiterService::isEnabled()) {
            return $next($request);
        }

        $blockInfo = RateLimiterService::isBlocked($request);

        if ($blockInfo) {
            return RateLimiterService::buildBlockedResponse($blockInfo, $request);
        }

        return $next($request);
    }
}
