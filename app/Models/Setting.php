<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ClearsSiteCache;
use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $key
 * @property mixed $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use ClearsSiteCache, HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['value' => 'json'];
    }
}
