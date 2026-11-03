<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Http\Resources\AuthorResource;
use App\Models\Article;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AuthorController extends Controller
{
    private const int PER_PAGE = 12;

    public function show(string $slug): Response
    {
        $author = User::query()->where('slug', $slug)->where('is_active', true)->firstOrFail();

        $articles = Article::query()->published()->forCard()
            ->where('author_id', $author->id)
            ->latest('published_at')
            ->paginate(self::PER_PAGE);

        abort_if($articles->total() === 0 && ! $author->canAccessNewsroom(), 404);

        return Inertia::render('authors/show', [
            'author' => new AuthorResource($author),
            'articles' => ArticleCardResource::collection($articles),
        ]);
    }
}
