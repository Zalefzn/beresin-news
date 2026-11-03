<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ClearsSiteCache;
use Database\Factories\BreakingNewsFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $text
 * @property int|null $article_id
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property int $sort_order
 * @property-read Article|null $article
 */
#[Fillable(['text', 'article_id', 'starts_at', 'ends_at', 'sort_order'])]
class BreakingNews extends Model
{
    /** @use HasFactory<BreakingNewsFactory> */
    use ClearsSiteCache, HasFactory;

    protected $table = 'breaking_news';

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }

    /** @return BelongsTo<Article, $this> */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * @param  Builder<BreakingNews>  $query
     * @return Builder<BreakingNews>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where(fn (Builder $inner) => $inner->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $inner) => $inner->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->orderBy('sort_order');
    }
}
