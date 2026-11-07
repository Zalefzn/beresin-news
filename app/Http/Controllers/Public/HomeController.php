<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetPopularArticles;
use App\Actions\GetSharedSiteData;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const int FEED_PER_PAGE = 8;

    public function __invoke(Request $request, GetPopularArticles $popularArticles, GetSharedSiteData $site): Response
    {
        $category = $request->string('kategori')->toString();
        $sort = $request->string('urut')->toString() === 'terpopuler' ? 'terpopuler' : 'terbaru';

        $headline = Article::query()->published()->forCard()
            ->orderByDesc('is_headline')
            ->latest('published_at')
            ->first();

        $trending = Article::query()->published()->forCard()
            ->where('is_trending', true)
            ->when($headline, fn ($query) => $query->whereKeyNot($headline?->id))
            ->latest('published_at')
            ->limit(3)
            ->get();

        $feed = Article::query()->published()->forCard()
            ->when($category !== '', fn ($query) => $query->whereHas('category', fn ($inner) => $inner->where('slug', $category)))
            ->when(
                $sort === 'terpopuler',
                fn ($query) => $query->orderByDesc('views_count'),
                fn ($query) => $query->latest('published_at'),
            );

        return Inertia::render('home', [
            'headline' => $headline ? new ArticleCardResource($headline) : null,
            'trending' => ArticleCardResource::collection($trending),
            'updatedLabel' => $headline ? Article::query()->published()->max('published_at') : null,
            'articles' => Inertia::scroll(fn () => ArticleCardResource::collection($feed->paginate(self::FEED_PER_PAGE))),
            'popular' => Inertia::defer(fn () => ArticleCardResource::collection($popularArticles->handle(now()->subDay()))),
            'filters' => ['kategori' => $category, 'urut' => $sort],
            'jsonLd' => $this->jsonLd($site),
        ]);
    }

    /**
     * WebSite and NewsMediaOrganization data that let Google show the site name, logo and social profiles.
     */
    private function jsonLd(GetSharedSiteData $site): string
    {
        $homeUrl = route('home');
        $social = $site->setting('social');
        $contact = $site->setting('contact');

        $organization = array_filter([
            '@type' => 'NewsMediaOrganization',
            '@id' => $homeUrl.'#organization',
            'name' => $site->setting('site_name'),
            'url' => $homeUrl,
            'logo' => ['@type' => 'ImageObject', 'url' => url('/logo.png')],
            'sameAs' => is_array($social) ? array_values(array_filter($social)) : [],
            'email' => is_array($contact) ? ($contact['email'] ?? null) : null,
            'telephone' => is_array($contact) ? ($contact['phone'] ?? null) : null,
        ]);

        return (string) json_encode([
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'WebSite',
                    '@id' => $homeUrl.'#website',
                    'name' => $site->setting('site_name'),
                    'alternateName' => 'Beresin News',
                    'url' => $homeUrl,
                    'inLanguage' => 'id-ID',
                    'publisher' => ['@id' => $homeUrl.'#organization'],
                ],
                $organization,
            ],
        ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
