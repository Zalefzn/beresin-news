<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\LiveChatMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $live_stream_id
 * @property int $user_id
 * @property string $body
 * @property bool $is_hidden
 * @property Carbon|null $created_at
 * @property-read User $user
 */
#[Fillable(['live_stream_id', 'user_id', 'body', 'is_hidden'])]
class LiveChatMessage extends Model
{
    /** @use HasFactory<LiveChatMessageFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['is_hidden' => 'boolean'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
