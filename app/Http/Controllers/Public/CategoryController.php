<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetPopularArticles;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Http\Resources\CategoryResource;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    private const int PER_PAGE = 8;

    public function show(Request $request, string $slug, GetPopularArticles $popularArticles): Response
    {
        $category = Category::query()->where('slug', $slug)->where('is_active', true)->firstOrFail();
        $sort = $request->string('urut')->toString() === 'terpopuler' ? 'terpopuler' : 'terbaru';

        $featured = Article::query()->published()->forCard()
            ->where('category_id', $category->id)
            ->latest('published_at')
            ->first();

        $articles = Article::query()->published()->forCard()
            ->where('category_id', $category->id)
            ->when($featured, fn ($query) => $query->whereKeyNot($featured?->id))
            ->when(
                $sort === 'terpopuler',
                fn ($query) => $query->orderByDesc('views_count'),
                fn ($query) => $query->latest('published_at'),
            );

        return Inertia::render('categories/show', [
            'category' => new CategoryResource($category),
            'featured' => $featured ? new ArticleCardResource($featured) : null,
            'articles' => Inertia::scroll(fn () => ArticleCardResource::collection($articles->paginate(self::PER_PAGE))),
            'popular' => Inertia::defer(fn () => ArticleCardResource::collection($popularArticles->handle(now()->subDays(7), 5, $category->id))),
            'filters' => ['urut' => $sort],
        ]);
    }
}
