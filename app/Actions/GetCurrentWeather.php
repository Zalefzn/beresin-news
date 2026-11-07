<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Current air temperature for a city, from MET Norway (free for commercial use, CC BY 4.0),
 * with the city located once through OpenStreetMap Nominatim. Both ask for an identifying
 * User-Agent and for results to be cached, so lookups are cached and never block for long.
 */
class GetCurrentWeather
{
    public const string SOURCE = 'MET Norway';

    private const string USER_AGENT = 'BeresinNews/1.0 (+https://beresinnews.com)';

    private const string FORECAST_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

    private const string GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';

    /** Fresh for 30 minutes, then served stale for up to 30 more while it refreshes after the response. */
    private const array TEMPERATURE_TTL = [1800, 3600];

    private const int TIMEOUT_SECONDS = 4;

    /**
     * Returns a label such as "29°C", or null when the city is unknown or the service is down.
     */
    public function temperature(string $city): ?string
    {
        $city = trim($city);

        if ($city === '') {
            return null;
        }

        // An empty string is cached for failures too, so an outage is not retried on every page view.
        $label = Cache::flexible(
            'weather.temperature.'.Str::slug($city),
            self::TEMPERATURE_TTL,
            fn (): string => $this->fetchTemperature($city) ?? '',
        );

        return $label === '' ? null : $label;
    }

    private function fetchTemperature(string $city): ?string
    {
        $coordinates = $this->coordinates($city);

        if ($coordinates === null) {
            return null;
        }

        try {
            $response = $this->client()->get(self::FORECAST_URL, [
                'lat' => round($coordinates['lat'], 4),
                'lon' => round($coordinates['lon'], 4),
            ]);
        } catch (ConnectionException) {
            return null;
        }

        $temperature = $response->successful()
            ? $response->json('properties.timeseries.0.data.instant.details.air_temperature')
            : null;

        return is_numeric($temperature) ? round((float) $temperature).'°C' : null;
    }

    /**
     * A city does not move, so its coordinates are cached until the admin picks another city.
     *
     * @return array{lat: float, lon: float}|null
     */
    private function coordinates(string $city): ?array
    {
        $cacheKey = 'weather.coordinates.'.Str::slug($city);
        $cached = Cache::get($cacheKey);

        if (is_array($cached) && isset($cached['lat'], $cached['lon'])) {
            return ['lat' => (float) $cached['lat'], 'lon' => (float) $cached['lon']];
        }

        try {
            $response = $this->client()->get(self::GEOCODE_URL, [
                'q' => $city.', Indonesia',
                'format' => 'jsonv2',
                'limit' => 1,
            ]);
        } catch (ConnectionException) {
            return null;
        }

        $lat = $response->successful() ? $response->json('0.lat') : null;
        $lon = $response->successful() ? $response->json('0.lon') : null;

        if (! is_numeric($lat) || ! is_numeric($lon)) {
            return null;
        }

        $coordinates = ['lat' => (float) $lat, 'lon' => (float) $lon];
        Cache::forever($cacheKey, $coordinates);

        return $coordinates;
    }

    private function client(): PendingRequest
    {
        return Http::withUserAgent(self::USER_AGENT)
            ->acceptJson()
            ->timeout(self::TIMEOUT_SECONDS);
    }
}
