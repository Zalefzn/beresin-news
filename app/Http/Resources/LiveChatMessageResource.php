<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\LiveChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LiveChatMessage
 */
class LiveChatMessageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(?Request $request = null): array
    {
        return [
            'id' => $this->id,
            'user' => $this->user->name,
            'user_id' => $this->user_id,
            'body' => $this->body,
            'time' => $this->created_at?->format('H:i'),
        ];
    }
}
