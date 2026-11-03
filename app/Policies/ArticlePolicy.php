<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessNewsroom();
    }

    public function create(User $user): bool
    {
        return $user->canAccessNewsroom();
    }

    public function update(User $user, Article $article): bool
    {
        return $user->isAdmin() || $this->canEditInternally($user, $article);
    }

    public function delete(User $user, Article $article): bool
    {
        return $user->isAdmin() || $this->canEditInternally($user, $article);
    }

    public function preview(User $user, Article $article): bool
    {
        return $user->canManageNewsroom() || $article->author_id === $user->id;
    }

    /**
     * Only the admin decides what goes live.
     */
    public function publish(User $user): bool
    {
        return $user->isAdmin();
    }

    public function viewSubmission(User $user, Article $article): bool
    {
        return $article->package !== null && $article->author_id === $user->id;
    }

    /**
     * Paid authors edit until the article enters review, and again after a rejection.
     */
    public function updateSubmission(User $user, Article $article): bool
    {
        return $this->viewSubmission($user, $article)
            && in_array($article->status, [ArticleStatus::Draft, ArticleStatus::Rejected], true);
    }

    /**
     * Staff never edit live or paid work, since that would bypass the admin's review.
     */
    private function canEditInternally(User $user, Article $article): bool
    {
        if ($article->package !== null || $article->status->requiresPublishPermission()) {
            return false;
        }

        return $user->canManageNewsroom()
            || ($user->canAccessNewsroom() && $article->author_id === $user->id);
    }
}
