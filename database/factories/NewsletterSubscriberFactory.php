<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NewsletterSubscriber>
 */
class NewsletterSubscriberFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['email' => fake()->unique()->safeEmail()];
    }

    public function confirmed(): static
    {
        return $this->state(['confirmed_at' => now()]);
    }
}
