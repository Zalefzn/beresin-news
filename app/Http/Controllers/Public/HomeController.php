<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetLiveBroadcast;
use App\Actions\GetPopularArticles;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Http\Resources\VideoResource;
use App\Models\Article;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const int FEED_PER_PAGE = 8;

    public function __invoke(Request $request, GetLiveBroadcast $liveBroadcast, GetPopularArticles $popularArticles): Response
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
            'videos' => VideoResource::collection(Video::query()->published()->with('category')->latest('published_at')->limit(3)->get()),
            'liveStream' => $liveBroadcast->handle(),
            'filters' => ['kategori' => $category, 'urut' => $sort],
        ]);
    }
}
