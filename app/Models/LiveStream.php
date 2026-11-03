<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\LiveStreamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $title
 * @property string|null $stream_url
 * @property bool $is_live
 * @property int $viewer_count
 */
#[Fillable(['title', 'stream_url', 'is_live', 'viewer_count'])]
class LiveStream extends Model
{
    /** @use HasFactory<LiveStreamFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['is_live' => 'boolean'];
    }

    /** @return HasMany<LiveChatMessage, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(LiveChatMessage::class);
    }
}
