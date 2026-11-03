<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CommentStatus;
use App\Models\Article;
use App\Models\Comment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
class CommentFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'article_id' => Article::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'body' => fake()->sentence(),
            'status' => CommentStatus::Approved,
            'ip_address' => fake()->ipv4(),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => CommentStatus::Pending]);
    }
}
