<?php

use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureAccountIsApproved;
use App\Http\Middleware\EnsureNewsroomAccess;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectToCanonicalHost;
use App\Http\Resources\ArticleCardResource;
use App\Models\Article;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\ExceptionResponse;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // In production the app is only reachable through the Traefik reverse proxy, which terminates HTTPS.
        $middleware->trustProxies(at: env('TRUSTED_PROXIES'));

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Midtrans cannot send a CSRF token; the webhook verifies its signature instead.
        $middleware->preventRequestForgery(except: ['midtrans/notifikasi']);

        $middleware->web(prepend: [RedirectToCanonicalHost::class]);

        $middleware->web(append: [
            HandleAppearance::class,
            EnsureAccountIsActive::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias(['newsroom' => EnsureNewsroomAccess::class, 'approved' => EnsureAccountIsApproved::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        Inertia::handleExceptionsUsing(function (ExceptionResponse $response) {
            $status = $response->statusCode();
            $showsDebugPage = app()->hasDebugModeEnabled() && $status >= 500;

            if ($showsDebugPage || ! in_array($status, [403, 404, 419, 500, 503], true)) {
                return null;
            }

            return $response
                ->render('errors/error', [
                    'status' => $status,
                    'latest' => $status === 404
                        ? ArticleCardResource::collection(Article::query()->published()->forCard()->latest('published_at')->limit(4)->get())
                        : [],
                ])
                ->withSharedData();
        });
    })->create();
