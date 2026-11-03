<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Http\Resources\TagResource;
use App\Models\Article;
use App\Models\Tag;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    private const int PER_PAGE = 12;

    public function show(string $slug): Response
    {
        $tag = Tag::query()->where('slug', $slug)->firstOrFail();

        $articles = Article::query()->published()->forCard()
            ->whereHas('tags', fn ($query) => $query->whereKey($tag->id))
            ->latest('published_at')
            ->paginate(self::PER_PAGE);

        return Inertia::render('tags/show', [
            'tag' => new TagResource($tag),
            'articles' => ArticleCardResource::collection($articles),
        ]);
    }
}
