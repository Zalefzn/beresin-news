<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $article_id
 * @property int|null $user_id
 * @property string|null $session_hash
 */
#[Fillable(['article_id', 'user_id', 'session_hash'])]
class ArticleLike extends Model {}
