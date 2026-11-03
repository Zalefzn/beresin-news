<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $article_id
 * @property string $session_hash
 * @property Carbon $viewed_at
 */
#[Fillable(['article_id', 'session_hash', 'viewed_at'])]
class ArticleView extends Model
{
    public $timestamps = false;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['viewed_at' => 'datetime'];
    }
}
