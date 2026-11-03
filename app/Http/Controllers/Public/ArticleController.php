<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetPopularArticles;
use App\Actions\GetSharedSiteData;
use App\Actions\RecordArticleView;
use App\Actions\ToggleArticleLike;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CommentResource;
use App\Models\Article;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    private const int INDEX_PER_PAGE = 30;

    private const int COMMENTS_PER_PAGE = 10;

    private const int POPULAR_RANKING_SIZE = 20;

    public function show(
        Request $request,
        string $category,
        string $article,
        RecordArticleView $recordView,
        ToggleArticleLike $likes,
        GetPopularArticles $popularArticles,
    ): Response|RedirectResponse {
        $model = Article::query()->published()->where('slug', $article)
            ->with(['category', 'author', 'media', 'tags'])
            ->firstOrFail();

        if ($model->category->slug !== $category) {
            return redirect()->to($model->url(), 301);
        }

        $recordView->handle($model, $request);

        $user = $request->user();

        return $this->renderArticle($model, $request, $popularArticles, [
            'isBookmarked' => $user ? $user->bookmarkedArticles()->whereKey($model->id)->exists() : false,
            'isLiked' => $likes->isLiked($model, $user, $recordView->sessionHash($request)),
            'isPreview' => false,
        ]);
    }

    public function preview(Request $request, string $token, GetPopularArticles $popularArticles): Response
    {
        $model = Article::query()->where('preview_token', $token)
            ->with(['category', 'author', 'media', 'tags'])
            ->firstOrFail();

        Gate::authorize('preview', $model);

        return $this->renderArticle($model, $request, $popularArticles, [
            'isBookmarked' => false,
            'isLiked' => false,
            'isPreview' => true,
        ]);
    }

    public function index(Request $request, GetSharedSiteData $site): Response
    {
        $date = $this->parseDate($request->string('tanggal')->toString());
        $category = $request->string('kategori')->toString();

        $articles = Article::query()->published()->forCard()
            ->when($date, fn (Builder $query) => $query->whereBetween('published_at', [$date?->copy()->startOfDay(), $date?->copy()->endOfDay()]))
            ->when($category !== '', fn (Builder $query) => $query->whereHas('category', fn (Builder $inner) => $inner->where('slug', $category)))
            ->latest('published_at')
            ->paginate(self::INDEX_PER_PAGE)
            ->withQueryString();

        return Inertia::render('articles/index', [
            'articles' => ArticleCardResource::collection($articles),
            'filters' => ['tanggal' => $date?->toDateString() ?? '', 'kategori' => $category],
        ]);
    }

    public function popular(Request $request, GetPopularArticles $popularArticles): Response
    {
        $period = $request->string('periode')->toString();
        $period = in_array($period, ['24jam', '7hari', '30hari'], true) ? $period : '24jam';

        $since = match ($period) {
            '7hari' => now()->subDays(7),
            '30hari' => now()->subDays(30),
            default => now()->subDay(),
        };

        return Inertia::render('articles/popular', [
            'articles' => ArticleCardResource::collection($popularArticles->handle($since, self::POPULAR_RANKING_SIZE)),
            'period' => $period,
        ]);
    }

    /**
     * @param  array{isBookmarked: bool, isLiked: bool, isPreview: bool}  $state
     */
    private function renderArticle(Article $model, Request $request, GetPopularArticles $popularArticles, array $state): Response
    {
        $comments = $model->comments()
            ->approved()
            ->whereNull('parent_id')
            ->with(['replies' => fn ($query) => $query->approved()->oldest()])
            ->latest()
            ->paginate(self::COMMENTS_PER_PAGE, ['*'], 'komentar')
            ->withQueryString();

        return Inertia::render('articles/show', [
            ...$state,
            'article' => new ArticleResource($model),
            'category' => new CategoryResource($model->category),
            'comments' => CommentResource::collection($comments),
            'related' => Inertia::defer(fn () => ArticleCardResource::collection(
                Article::query()->published()->forCard()
                    ->where('category_id', $model->category_id)
                    ->whereKeyNot($model->id)
                    ->latest('published_at')
                    ->limit(4)
                    ->get()
            )),
            'popular' => Inertia::defer(fn () => ArticleCardResource::collection($popularArticles->handle(now()->subDay()))),
            'jsonLd' => $this->jsonLd($model),
        ]);
    }

    private function jsonLd(Article $article): string
    {
        return (string) json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'headline' => $article->title,
            'image' => array_filter([$article->coverUrl('hero')]),
            'datePublished' => $article->published_at?->toIso8601String(),
            'dateModified' => $article->updated_at?->toIso8601String(),
            'author' => ['@type' => 'Person', 'name' => $article->author->name],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name'),
                'logo' => ['@type' => 'ImageObject', 'url' => url('/logo.png')],
            ],
            'mainEntityOfPage' => $article->url(),
        ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function parseDate(string $value): ?Carbon
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            return null;
        }

        return rescue(fn (): Carbon => Carbon::parse($value), null, false);
    }
}
