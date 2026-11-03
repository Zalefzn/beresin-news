<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BreakingNews;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BreakingNews>
 */
class BreakingNewsFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['text' => fake()->sentence(), 'sort_order' => 0];
    }
}
