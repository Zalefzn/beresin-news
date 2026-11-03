<?php

declare(strict_types=1);

namespace App\Enums;

enum ArticlePackage: string
{
    case General = 'umum';
    case Branding = 'branding';

    public function label(): string
    {
        return match ($this) {
            self::General => 'Berita Umum',
            self::Branding => 'Berita Khusus / Branding',
        };
    }

    /**
     * The disclosure readers see, as the Dewan Pers cyber media guideline requires for paid content.
     */
    public function publicLabel(): string
    {
        return match ($this) {
            self::General => 'Konten Berbayar',
            self::Branding => 'Advertorial',
        };
    }

    public function priceSettingKey(): string
    {
        return match ($this) {
            self::General => 'price_general',
            self::Branding => 'price_branding',
        };
    }
}
