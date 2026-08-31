<?php

use App\Http\Middleware\AuditLogFailedCreations;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ], append: [
            SetLocale::class,
            AuditLogFailedCreations::class,
        ]);

        $middleware->preventRequestForgery(except: [
            'api/auth/*',
        ]);

        $middleware->alias([
            'check.role' => CheckRole::class,
        ]);

        $middleware->redirectGuestsTo('/');

        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Log all critical/unexpected errors in production
        $exceptions->report(function (Throwable $e) {
            if (app()->environment('production')) {
                Log::channel('daily')->error($e->getMessage(), [
                    'exception' => $e,
                    'url' => request()->fullUrl(),
                    'input' => request()->except(['password', 'password_confirmation']),
                ]);
            }
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            $isJson = $request->is('api/*') || $request->expectsJson();

            // 1. Let Laravel handle ValidationException by default
            if ($e instanceof ValidationException) {
                return null;
            }

            // 2. Handle Authentication Exception
            if ($e instanceof AuthenticationException) {
                if ($isJson) {
                    return response()->json([
                        'error' => 'unauthorized',
                        'message' => __('messages.error_session_expired'),
                    ], 401);
                }

                return redirect()->guest('/')->with('error', __('messages.error_session_expired'));
            }

            // 3. Handle Authorization Exception
            if ($e instanceof AccessDeniedHttpException || $e instanceof AuthorizationException) {
                if ($isJson) {
                    return response()->json([
                        'error' => 'forbidden',
                        'message' => __('messages.error_403_description'),
                    ], 403);
                }

                return response()->view('errors.403', [], 403);
            }

            // 4. Handle Not Found
            if ($e instanceof NotFoundHttpException) {
                if ($isJson) {
                    return response()->json([
                        'error' => 'not_found',
                        'message' => __('messages.error_404_description'),
                    ], 404);
                }

                return response()->view('errors.404', [], 404);
            }

            // 5. Handle Token Mismatch (CSRF)
            if ($e instanceof TokenMismatchException) {
                if ($isJson) {
                    return response()->json([
                        'error' => 'csrf_expired',
                        'message' => __('messages.error_419_description'),
                    ], 419);
                }

                return response()->view('errors.419', [], 419);
            }

            // 6. Generic 500/Server error in production
            if (app()->environment('production') || ! config('app.debug')) {
                $statusCode = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

                if ($isJson) {
                    return response()->json([
                        'error' => 'server_error',
                        'message' => __('messages.error_500_description'),
                    ], $statusCode);
                }

                return response()->view('errors.500', [], 500);
            }

            return null;
        });
    })->create();
