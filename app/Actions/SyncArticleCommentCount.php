<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Article;
use App\Models\Comment;

class SyncArticleCommentCount
{
    public function handle(Article $article): void
    {
        Article::withTrashed()->whereKey($article->id)->update([
            'comments_count' => Comment::query()->where('article_id', $article->id)->approved()->count(),
        ]);
    }
}
