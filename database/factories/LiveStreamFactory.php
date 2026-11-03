<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\LiveStream;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LiveStream>
 */
class LiveStreamFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'title' => 'BeresinStream HD - Siaran Langsung 24/7',
            'stream_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            'is_live' => true,
            'viewer_count' => 0,
        ];
    }
}
