<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The signed-in user as seen by their own browser.
 *
 * @mixin User
 */
class CurrentUserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'role' => $this->role->value,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'can_access_newsroom' => $this->canAccessNewsroom(),
            'can_manage_newsroom' => $this->canManageNewsroom(),
            'is_admin' => $this->isAdmin(),
            'is_chat_blocked' => $this->chat_blocked_at !== null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
