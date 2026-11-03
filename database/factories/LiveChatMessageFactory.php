<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\LiveChatMessage;
use App\Models\LiveStream;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LiveChatMessage>
 */
class LiveChatMessageFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'live_stream_id' => LiveStream::factory(),
            'user_id' => User::factory(),
            'body' => fake()->sentence(),
            'is_hidden' => false,
        ];
    }
}
