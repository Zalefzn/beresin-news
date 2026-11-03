<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Video;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Video>
 */
class VideoFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(5);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'source_url' => 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            'thumbnail' => null,
            'duration' => '05:20',
            'description' => fake()->sentence(),
            'views_count' => fake()->numberBetween(0, 50000),
            'published_at' => now()->subDay(),
        ];
    }
}
