<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Actions\GetSharedSiteData;

trait ClearsSiteCache
{
    protected static function bootClearsSiteCache(): void
    {
        static::saved(fn () => GetSharedSiteData::flush());
        static::deleted(fn () => GetSharedSiteData::flush());
    }
}
