<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\User;

class PublishArticle
{
    public function handle(Article $article, ?User $editor = null): void
    {
        $article->update([
            'status' => ArticleStatus::Published,
            'published_at' => $article->published_at?->isPast() ? $article->published_at : now(),
            'editor_id' => $editor->id ?? $article->editor_id,
        ]);
    }
}
