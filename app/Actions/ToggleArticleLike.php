<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class ToggleArticleLike
{
    public function isLiked(Article $article, ?User $user, string $sessionHash): bool
    {
        return $this->query($article, $user, $sessionHash)->exists();
    }

    /**
     * Likes the article once per user or session. Repeating the call has no further effect.
     */
    public function like(Article $article, ?User $user, string $sessionHash): void
    {
        if ($this->isLiked($article, $user, $sessionHash)) {
            return;
        }

        try {
            DB::transaction(function () use ($article, $user, $sessionHash): void {
                ArticleLike::query()->create([
                    'article_id' => $article->id,
                    'user_id' => $user?->id,
                    'session_hash' => $user ? null : $sessionHash,
                ]);

                Article::query()->whereKey($article->id)->increment('likes_count');
            });
        } catch (UniqueConstraintViolationException) {
            return;
        }
    }

    /** @return Builder<ArticleLike> */
    private function query(Article $article, ?User $user, string $sessionHash): Builder
    {
        return ArticleLike::query()
            ->where('article_id', $article->id)
            ->when(
                $user,
                fn ($query) => $query->where('user_id', $user?->id),
                fn ($query) => $query->where('session_hash', $sessionHash),
            );
    }
}
