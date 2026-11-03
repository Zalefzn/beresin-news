<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CommentStatus;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;

class SubmitComment
{
    /**
     * @param  array{body: string, name?: string|null, email?: string|null, parent_id?: int|null}  $data
     */
    public function handle(Article $article, array $data, ?User $user, ?string $ipAddress): Comment
    {
        $isTrusted = $user !== null && $user->hasVerifiedEmail();

        $comment = $article->comments()->create([
            'user_id' => $user?->id,
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $user->name ?? strip_tags((string) ($data['name'] ?? '')),
            'email' => $user->email ?? ($data['email'] ?? null),
            'body' => trim(strip_tags($data['body'])),
            'status' => $isTrusted ? CommentStatus::Approved : CommentStatus::Pending,
            'ip_address' => $ipAddress,
        ]);

        (new SyncArticleCommentCount)->handle($article);

        return $comment;
    }
}
