<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ClearsSiteCache;
use Database\Factories\TagFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property bool $is_trending
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'slug', 'is_trending'])]
class Tag extends Model
{
    /** @use HasFactory<TagFactory> */
    use ClearsSiteCache, HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['is_trending' => 'boolean'];
    }

    /** @return BelongsToMany<Article, $this> */
    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class);
    }
}
