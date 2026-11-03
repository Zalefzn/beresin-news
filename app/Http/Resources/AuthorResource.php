<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public author profile. Never includes the email address.
 *
 * @mixin User
 */
class AuthorResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'avatar' => $this->avatar,
            'job_title' => $this->job_title,
            'bio' => $this->bio,
            'social' => $this->social ?? [],
            'url' => $this->slug ? route('authors.show', $this->slug) : null,
        ];
    }
}
