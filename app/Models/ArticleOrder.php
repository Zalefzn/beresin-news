<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ArticlePackage;
use App\Enums\OrderStatus;
use Database\Factories\ArticleOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * The amount is a snapshot, so later price changes do not touch existing orders.
 *
 * @property int $id
 * @property int $article_id
 * @property int $user_id
 * @property ArticlePackage $package
 * @property int $amount
 * @property OrderStatus $status
 * @property string $midtrans_order_id
 * @property string|null $payment_url
 * @property string|null $payment_type
 * @property Carbon|null $paid_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Article $article
 * @property-read User $user
 */
#[Fillable(['article_id', 'user_id', 'package', 'amount', 'status', 'midtrans_order_id', 'payment_url', 'payment_type', 'paid_at'])]
class ArticleOrder extends Model
{
    /** @use HasFactory<ArticleOrderFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'package' => ArticlePackage::class,
            'status' => OrderStatus::class,
            'amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class)->withTrashed();
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
