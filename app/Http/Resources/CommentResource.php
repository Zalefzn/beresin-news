<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public comment. Email and IP address stay on the server.
 *
 * @mixin Comment
 */
class CommentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'body' => $this->body,
            'created_at' => $this->created_at?->toIso8601String(),
            'created_label' => $this->created_at?->diffForHumans(),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
