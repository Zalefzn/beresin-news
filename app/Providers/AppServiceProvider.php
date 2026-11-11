<?php

declare(strict_types=1);

namespace App\Providers;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        Carbon::setLocale('id');
        CarbonImmutable::setLocale('id');

        JsonResource::withoutWrapping();
        Model::preventLazyLoading(! app()->isProduction());

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // The client asked for no complexity rules: eight characters is the only requirement.
        Password::defaults(fn (): Password => Password::min(8));
    }

    /**
     * Rate limits answer with a friendly flash message instead of an error page.
     */
    protected function configureRateLimiting(): void
    {
        $tooMany = fn (string $message): callable => function () use ($message): RedirectResponse {
            Inertia::flash('error', $message);

            return back();
        };

        RateLimiter::for('comments', fn (Request $request): Limit => Limit::perMinute(3)
            ->by((string) $request->ip())
            ->response($tooMany('Terlalu banyak komentar. Silakan coba lagi sebentar.')));

        RateLimiter::for('likes', fn (Request $request): Limit => Limit::perMinute(30)
            ->by((string) $request->ip())
            ->response($tooMany('Terlalu banyak permintaan. Silakan coba lagi sebentar.')));

        RateLimiter::for('newsletter', fn (Request $request): Limit => Limit::perMinute(5)
            ->by((string) $request->ip())
            ->response($tooMany('Terlalu banyak percobaan. Silakan coba lagi sebentar.')));

        RateLimiter::for('contact', fn (Request $request): Limit => Limit::perMinute(3)
            ->by((string) $request->ip())
            ->response($tooMany('Terlalu banyak pesan. Silakan coba lagi sebentar.')));
    }
}
