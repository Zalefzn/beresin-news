<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string $body
 * @property string|null $meta_description
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'slug', 'body', 'meta_description'])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;
}
