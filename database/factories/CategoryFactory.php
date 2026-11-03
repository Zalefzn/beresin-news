<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->word().' '.fake()->word());

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'color' => fake()->randomElement(['bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-emerald-600', 'bg-amber-600']),
            'description' => fake()->sentence(),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
