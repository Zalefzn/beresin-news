<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class CategoryPolicy
{
    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
