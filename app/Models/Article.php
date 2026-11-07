<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ArticlePackage;
use App\Enums\ArticleStatus;
use App\Enums\OrderStatus;
use App\Models\Concerns\ClearsSiteCache;
use Database\Factories\ArticleFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $dateline
 * @property string|null $excerpt
 * @property string $body
 * @property string|null $cover_caption
 * @property string|null $cover_credit
 * @property int $category_id
 * @property int $author_id
 * @property int|null $editor_id
 * @property ArticleStatus $status
 * @property ArticlePackage|null $package
 * @property string|null $rejection_reason
 * @property Carbon|null $published_at
 * @property bool $is_headline
 * @property bool $is_trending
 * @property bool $is_breaking
 * @property int $reading_time
 * @property int $views_count
 * @property int $likes_count
 * @property int $comments_count
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property string $preview_token
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read User $author
 */
#[Fillable([
    'title', 'slug', 'dateline', 'excerpt', 'body', 'cover_caption', 'cover_credit', 'category_id',
    'author_id', 'editor_id', 'status', 'package', 'rejection_reason', 'published_at', 'is_headline', 'is_trending', 'is_breaking',
    'reading_time', 'views_count', 'likes_count', 'comments_count', 'meta_title', 'meta_description', 'preview_token',
])]
class Article extends Model implements HasMedia
{
    /** @use HasFactory<ArticleFactory> */
    use ClearsSiteCache, HasFactory, InteractsWithMedia, Searchable, SoftDeletes;

    private const int WORDS_PER_MINUTE = 200;

    protected static function booted(): void
    {
        static::creating(function (Article $article): void {
            $article->preview_token ??= Str::random(48);
        });

        static::saving(function (Article $article): void {
            if ($article->isDirty('body')) {
                $words = str_word_count(strip_tags($article->body));
                $article->reading_time = max(1, (int) ceil($words / self::WORDS_PER_MINUTE));
            }
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => ArticleStatus::class,
            'package' => ArticlePackage::class,
            'published_at' => 'datetime',
            'is_headline' => 'boolean',
            'is_trending' => 'boolean',
            'is_breaking' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** @return BelongsTo<User, $this> */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    /** @return BelongsToMany<Tag, $this> */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /** @return HasMany<Comment, $this> */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /** @return HasMany<ArticleView, $this> */
    public function views(): HasMany
    {
        return $this->hasMany(ArticleView::class);
    }

    /** @return HasMany<ArticleOrder, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(ArticleOrder::class);
    }

    /** @return HasMany<ArticleLike, $this> */
    public function likes(): HasMany
    {
        return $this->hasMany(ArticleLike::class);
    }

    /**
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ArticleStatus::Published)->where('published_at', '<=', now());
    }

    /**
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function scopeForCard(Builder $query): Builder
    {
        return $query->with(['category', 'author', 'media']);
    }

    /**
     * Orders by views recorded since the given time, falling back on lifetime views.
     *
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function scopePopularSince(Builder $query, DateTimeInterface $since): Builder
    {
        return $query
            ->withCount(['views as recent_views_count' => fn (Builder $views) => $views->where('viewed_at', '>=', $since)])
            ->orderByDesc('recent_views_count')
            ->orderByDesc('views_count');
    }

    public function isPubliclyVisible(): bool
    {
        return $this->status === ArticleStatus::Published
            && $this->published_at !== null
            && $this->published_at->lte(now())
            && $this->deleted_at === null;
    }

    public function hasPaidOrder(): bool
    {
        return $this->relationLoaded('orders')
            ? $this->orders->contains('status', OrderStatus::Paid)
            : $this->orders()->where('status', OrderStatus::Paid)->exists();
    }

    public function url(bool $absolute = true): string
    {
        return route('articles.show', ['category' => $this->category->slug, 'article' => $this->slug], $absolute);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        foreach (['thumb' => 400, 'card' => 800, 'hero' => 1200] as $name => $width) {
            $this->addMediaConversion($name)
                ->format('webp')
                ->fit(Fit::Max, $width, $width);
        }
    }

    /**
     * Falls back to the original file while a queued conversion has not finished.
     */
    public function coverUrl(string $conversion = 'card'): ?string
    {
        $media = $this->getFirstMedia('cover');

        if ($media === null) {
            return null;
        }

        return $media->getUrl($media->hasGeneratedConversion($conversion) ? $conversion : '');
    }

    public function coverSrcset(): ?string
    {
        $media = $this->getFirstMedia('cover');

        if ($media === null) {
            return null;
        }

        $sources = collect(['thumb' => 400, 'card' => 800, 'hero' => 1200])
            ->filter(fn (int $width, string $name): bool => $media->hasGeneratedConversion($name))
            ->map(fn (int $width, string $name): string => $media->getUrl($name)." {$width}w");

        return $sources->isEmpty() ? null : $sources->implode(', ');
    }

    /**
     * Sanitized body with the dateline placed at the start of the first paragraph.
     */
    public function bodyWithDateline(): string
    {
        if ($this->dateline === null || $this->dateline === '') {
            return $this->body;
        }

        $dateline = '<strong>'.e(Str::upper($this->dateline)).'</strong> — ';
        $replaced = preg_replace('/<p>/', '<p>'.addcslashes($dateline, '\\$'), $this->body, 1, $count);

        return $count > 0 && is_string($replaced) ? $replaced : $dateline.$this->body;
    }

    /** @return array<string, mixed> */
    public function toSearchableArray(): array
    {
        return [
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
        ];
    }
}
