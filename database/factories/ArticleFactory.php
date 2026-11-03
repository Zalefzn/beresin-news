<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(6);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'dateline' => 'JAKARTA',
            'excerpt' => fake()->sentence(12),
            'body' => '<p>'.fake()->paragraph().'</p><p>'.fake()->paragraph().'</p><p>'.fake()->paragraph().'</p>',
            'category_id' => Category::factory(),
            'author_id' => User::factory()->writer(),
            'status' => ArticleStatus::Published,
            'published_at' => now()->subHour(),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => ArticleStatus::Draft, 'published_at' => null]);
    }

    public function scheduled(): static
    {
        return $this->state(['status' => ArticleStatus::Scheduled, 'published_at' => now()->addDay()]);
    }

    public function review(): static
    {
        return $this->state(['status' => ArticleStatus::Review, 'published_at' => null]);
    }

    public function headline(): static
    {
        return $this->state(['is_headline' => true]);
    }
}
