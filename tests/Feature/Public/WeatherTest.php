<?php

declare(strict_types=1);

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config(['services.weather.enabled' => true]);
    Setting::query()->create(['key' => 'weather_city', 'value' => 'Bandung']);
    Setting::query()->create(['key' => 'weather_temp', 'value' => '25°C']);
});

function fakeWeatherServices(float $temperature = 27.6): void
{
    Http::fake([
        'nominatim.openstreetmap.org/*' => Http::response([['lat' => '-6.9175', 'lon' => '107.6191']]),
        'api.met.no/*' => Http::response(['properties' => ['timeseries' => [
            ['data' => ['instant' => ['details' => ['air_temperature' => $temperature]]]],
        ]]]),
    ]);
}

/** Server-side rendering also uses the HTTP client, so only weather hosts are counted. */
function weatherCalls(): int
{
    return Http::recorded(fn ($request) => str_contains($request->url(), 'api.met.no')
        || str_contains($request->url(), 'nominatim.openstreetmap.org'))->count();
}

test('the top bar shows the live temperature for the configured city', function () {
    fakeWeatherServices();

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('site.weatherCity', 'Bandung')
        ->where('site.weatherTemp', '28°C')
        ->where('site.weatherSource', 'MET Norway'));

    Http::assertSent(fn ($request) => str_contains($request->url(), 'api.met.no')
        && $request['lat'] === -6.9175
        && $request->hasHeader('User-Agent', 'BeresinNews/1.0 (+https://beresinnews.com)'));

    // The second page view is served from cache.
    $this->get(route('home'));
    expect(weatherCalls())->toBe(2);
});

test('the typed temperature is used when the weather service fails', function () {
    Http::fake(['*' => Http::response('', 500)]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('site.weatherTemp', '25°C')
        ->where('site.weatherSource', null));
});

test('admins can switch automatic weather off', function () {
    fakeWeatherServices();
    Setting::query()->create(['key' => 'weather_auto', 'value' => false]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('site.weatherTemp', '25°C')
        ->where('site.weatherSource', null));

    expect(weatherCalls())->toBe(0);
});
