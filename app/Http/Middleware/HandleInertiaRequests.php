<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Actions\GetSharedSiteData;
use App\Http\Resources\CurrentUserResource;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $site = app(GetSharedSiteData::class);
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'appUrl' => rtrim((string) config('app.url'), '/'),
            'auth' => [
                'user' => $user ? (new CurrentUserResource($user))->resolve($request) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'navCategories' => fn (): array => $site->categories(),
            'trendingTags' => fn (): array => $site->trendingTags(),
            'breakingNews' => fn (): array => $site->breakingNews(),
            'site' => function () use ($site): array {
                $weather = $site->weather();

                return [
                    'name' => $site->setting('site_name'),
                    'weatherCity' => $site->setting('weather_city'),
                    'weatherTemp' => $weather['temperature'],
                    'weatherSource' => $weather['source'],
                    'social' => $site->setting('social'),
                    'contact' => $site->setting('contact'),
                    'footerText' => $site->setting('footer_text'),
                    'analyticsCode' => $site->setting('analytics_code'),
                ];
            },
            'unreadNotifications' => fn (): int => $user?->unreadNotifications()->count() ?? 0,
            'savedIds' => fn (): array => $user
                ? $user->bookmarkedArticles()->pluck('articles.id')->all()
                : [],
        ];
    }
}
