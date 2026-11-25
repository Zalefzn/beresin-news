<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\User;
use App\Notifications\SubmissionNotification;

class ReviewArticle
{
    public function __construct(private PublishArticle $publishArticle) {}

    /**
     * Publishes the story. A paid story also starts running as an ad, unless an admin already set up its run.
     */
    public function approve(Article $article, User $admin): void
    {
        $article->fill(['rejection_reason' => null]);

        if ($article->package !== null && ! $article->is_sponsored && $article->sponsored_until === null) {
            $article->fill([
                'is_sponsored' => true,
                'sponsored_until' => now()->addDays(Article::SPONSORED_DAYS),
            ]);
        }

        $article->save();
        $this->publishArticle->handle($article, $admin);

        $article->loadMissing(['author', 'category']);
        $article->author->notify(SubmissionNotification::approved($article));
    }

    public function reject(Article $article, User $admin, string $reason): void
    {
        $article->update([
            'status' => ArticleStatus::Rejected,
            'rejection_reason' => $reason,
            'editor_id' => $admin->id,
        ]);

        $article->loadMissing('author');
        $article->author->notify(SubmissionNotification::rejected($article, $reason));
    }
}
