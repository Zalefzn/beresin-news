<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ArticlePackage;
use App\Models\Article;
use App\Models\BreakingNews;
use App\Models\Category;
use App\Models\Setting;
use App\Models\Tag;
use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Cached data shared with every public page. Cleared whenever the admin changes the source records.
 */
class GetSharedSiteData
{
    private const string VERSION_KEY = 'site.cache_version';

    private const int TTL_SECONDS = 3600;

    private const int BREAKING_TTL_SECONDS = 60;

    /** @var array<string, mixed> */
    private const array SETTING_DEFAULTS = [
        'site_name' => 'BeresinNews',
        'weather_city' => 'Jakarta',
        'weather_temp' => '29°C',
        'social' => [],
        'contact' => ['address' => '', 'email' => '', 'phone' => ''],
        'footer_text' => '',
        'analytics_code' => '',
        'live_quality' => '1080p 60FPS',
        'live_studio' => 'Beresin Studio Jakarta Central',
        'price_general' => 30000,
        'price_branding' => 50000,
    ];

    public static function flush(): void
    {
        Cache::forever(self::VERSION_KEY, ((int) Cache::get(self::VERSION_KEY, 0)) + 1);
    }

    /** @return array<int, array{id: int, name: string, slug: string, color: string, url: string}> */
    public function categories(): array
    {
        return $this->remember('categories', self::TTL_SECONDS, fn (): array => Category::query()
            ->active()
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'color' => $category->color,
                'url' => route('categories.show', $category->slug),
            ])->all());
    }

    /** @return array<int, array{id: int, name: string, slug: string, url: string}> */
    public function trendingTags(): array
    {
        return $this->remember('trending_tags', self::TTL_SECONDS, fn (): array => Tag::query()
            ->where('is_trending', true)
            ->orderBy('name')
            ->limit(3)
            ->get()
            ->map(fn (Tag $tag): array => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'url' => route('tags.show', $tag->slug),
            ])->all());
    }

    /** @return array<int, array{id: int, title: string, url: string|null}> */
    public function breakingNews(): array
    {
        return $this->remember('breaking_news', self::BREAKING_TTL_SECONDS, function (): array {
            $tickerItems = BreakingNews::query()
                ->active()
                ->with('article.category')
                ->get();

            $linkedArticleIds = $tickerItems->pluck('article_id')->filter()->all();

            $flaggedArticles = Article::query()
                ->published()
                ->where('is_breaking', true)
                ->whereNotIn('id', $linkedArticleIds)
                ->with('category')
                ->latest('published_at')
                ->limit(5)
                ->get()
                ->map(fn (Article $article): array => [
                    'id' => -$article->id,
                    'title' => $article->title,
                    'url' => $article->url(),
                ]);

            return $tickerItems
                ->map(fn (BreakingNews $item): array => [
                    'id' => $item->id,
                    'title' => $item->text,
                    'url' => $item->article?->isPubliclyVisible() ? $item->article->url() : null,
                ])
                ->concat($flaggedArticles)
                ->values()
                ->all();
        });
    }

    /** @return array<string, mixed> */
    public function settings(): array
    {
        return $this->remember('settings', self::TTL_SECONDS, fn (): array => [
            ...self::SETTING_DEFAULTS,
            ...Setting::query()->pluck('value', 'key')->all(),
        ]);
    }

    public function setting(string $key, mixed $default = null): mixed
    {
        return $this->settings()[$key] ?? $default;
    }

    public function packagePrice(ArticlePackage $package): int
    {
        $price = $this->setting($package->priceSettingKey());

        return is_numeric($price) ? (int) $price : 0;
    }

    /**
     * @template TValue
     *
     * @param  Closure(): TValue  $callback
     * @return TValue
     */
    private function remember(string $key, int $ttl, Closure $callback): mixed
    {
        $version = (int) Cache::get(self::VERSION_KEY, 0);

        return Cache::remember("site.{$version}.{$key}", $ttl, $callback);
    }
}
