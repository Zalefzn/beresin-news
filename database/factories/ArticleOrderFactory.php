<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ArticlePackage;
use App\Enums\OrderStatus;
use App\Models\Article;
use App\Models\ArticleOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ArticleOrder>
 */
class ArticleOrderFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'article_id' => Article::factory()->draft(),
            'user_id' => User::factory(),
            'package' => ArticlePackage::General,
            'amount' => 30000,
            'status' => OrderStatus::Pending,
            'midtrans_order_id' => 'BRN-'.Str::upper(Str::random(12)),
            'payment_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/token',
        ];
    }

    public function paid(): static
    {
        return $this->state(['status' => OrderStatus::Paid, 'paid_at' => now()]);
    }
}
