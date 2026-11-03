<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canManageNewsroom();
    }

    public function moderate(User $user, ?Comment $comment = null): bool
    {
        return $user->canManageNewsroom();
    }
}
