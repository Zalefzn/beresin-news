<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\TvProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TvProgram>
 */
class TvProgramFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->sentence(),
            'hosts' => fake()->name(),
            'day_of_week' => null,
            'starts_at' => '12:00:00',
            'ends_at' => '13:30:00',
        ];
    }
}
