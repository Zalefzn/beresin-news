<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    private const int MIN_QUERY_LENGTH = 2;

    private const int PER_PAGE = 10;

    private const int SUGGESTION_LIMIT = 5;

    public function index(Request $request): Response
    {
        $term = trim($request->string('q')->toString());
        $category = $request->string('kategori')->toString();
        $range = $request->string('rentang')->toString();
        $range = in_array($range, ['24jam', '7hari', '30hari', 'semua'], true) ? $range : 'semua';
        $sort = $request->string('urut')->toString() === 'terbaru' ? 'terbaru' : 'relevansi';

        $isSearchable = mb_strlen($term) >= self::MIN_QUERY_LENGTH;

        $results = null;

        if ($isSearchable) {
            $since = match ($range) {
                '24jam' => now()->subDay(),
                '7hari' => now()->subDays(7),
                '30hari' => now()->subDays(30),
                default => null,
            };

            $paginator = Article::search($term)
                ->query(fn ($query) => $query->published()->forCard()
                    ->when($category !== '', fn ($inner) => $inner->whereHas('category', fn ($c) => $c->where('slug', $category)))
                    ->when($since, fn ($inner) => $inner->where('published_at', '>=', $since))
                    ->when(
                        $sort === 'terbaru',
                        fn ($inner) => $inner->latest('published_at'),
                        fn ($inner) => $inner->orderByRaw('CASE WHEN LOWER(title) LIKE LOWER(?) THEN 0 ELSE 1 END', ["%{$term}%"])->latest('published_at'),
                    ))
                ->paginate(self::PER_PAGE)
                ->withQueryString();

            $results = ArticleCardResource::collection($paginator);
        }

        return Inertia::render('search/index', [
            'results' => $results,
            'filters' => ['q' => $term, 'kategori' => $category, 'rentang' => $range, 'urut' => $sort],
            'minLength' => self::MIN_QUERY_LENGTH,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $term = trim($request->string('q')->toString());

        if (mb_strlen($term) < self::MIN_QUERY_LENGTH) {
            return response()->json([]);
        }

        $articles = Article::search($term)
            ->query(fn ($query) => $query->published()->with('category')->latest('published_at'))
            ->take(self::SUGGESTION_LIMIT)
            ->get();

        return response()->json($articles->map(fn (Article $article): array => [
            'id' => $article->id,
            'title' => $article->title,
            'url' => $article->url(),
        ])->values());
    }
}
