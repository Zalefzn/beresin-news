<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetSharedSiteData;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Page;
use App\Models\Tag;
use App\Models\Video;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class FeedController extends Controller
{
    private const int RSS_SIZE = 30;

    private const int NEWS_SITEMAP_HOURS = 48;

    public function rss(): Response
    {
        return $this->rssResponse(
            $this->latestArticles()->all(),
            config('app.name').' - Berita Terbaru',
            route('home'),
            'Berita. Teknologi. Masa Depan.',
            route('feeds.rss'),
        );
    }

    public function rssCategory(string $category): Response
    {
        $model = Category::query()->where('slug', $category)->where('is_active', true)->firstOrFail();

        return $this->rssResponse(
            $this->latestArticles($model->id)->all(),
            config('app.name')." - {$model->name}",
            route('categories.show', $model->slug),
            $model->description ?? $model->name,
            route('feeds.rss.category', $model->slug),
        );
    }

    public function sitemap(): SymfonyResponse
    {
        $sitemap = Sitemap::create()
            ->add(Url::create(route('home'))->setPriority(1.0))
            ->add(Url::create(route('articles.index')))
            ->add(Url::create(route('articles.popular')))
            ->add(Url::create(route('live.index')))
            ->add(Url::create(route('videos.index')))
            ->add(Url::create(route('contact.show')));

        Category::query()->active()->get()->each(fn (Category $category) => $sitemap->add(Url::create(route('categories.show', $category->slug))));
        Tag::query()->get()->each(fn (Tag $tag) => $sitemap->add(Url::create(route('tags.show', $tag->slug))));
        Page::query()->get()->each(fn (Page $page) => $sitemap->add(Url::create(route('pages.show', $page->slug))));
        Video::query()->published()->get()->each(fn (Video $video) => $sitemap->add(Url::create(route('videos.show', $video->slug))));

        Article::query()->published()->with('category')->latest('published_at')->limit(5000)->get()
            ->each(function (Article $article) use ($sitemap): void {
                $tag = Url::create($article->url());

                if ($article->updated_at !== null) {
                    $tag->setLastModificationDate($article->updated_at);
                }

                $sitemap->add($tag);
            });

        return $sitemap->toResponse(request());
    }

    public function sitemapNews(GetSharedSiteData $site): Response
    {
        $articles = Article::query()->published()->with('category')
            ->where('published_at', '>=', now()->subHours(self::NEWS_SITEMAP_HOURS))
            ->latest('published_at')
            ->limit(1000)
            ->get();

        return response()
            ->view('feeds.sitemap-news', ['articles' => $articles, 'siteName' => $site->setting('site_name')])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /cari',
            'Disallow: /preview',
            'Disallow: /tersimpan',
            'Disallow: /settings',
            '',
            'Sitemap: '.route('feeds.sitemap'),
            'Sitemap: '.route('feeds.sitemap-news'),
            '',
        ]);

        return response($content)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    /** @return Collection<int, Article> */
    private function latestArticles(?int $categoryId = null): Collection
    {
        return Article::query()->published()->with('category')
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->latest('published_at')
            ->limit(self::RSS_SIZE)
            ->get();
    }

    /**
     * @param  array<int, Article>  $articles
     */
    private function rssResponse(array $articles, string $title, string $link, string $description, string $selfUrl): Response
    {
        return response()
            ->view('feeds.rss', compact('articles', 'title', 'link', 'description', 'selfUrl'))
            ->header('Content-Type', 'application/rss+xml; charset=UTF-8');
    }
}
