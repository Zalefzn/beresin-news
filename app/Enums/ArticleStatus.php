<?php

declare(strict_types=1);

namespace App\Enums;

enum ArticleStatus: string
{
    case Draft = 'draft';
    case Review = 'review';
    case Rejected = 'rejected';
    case Scheduled = 'scheduled';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Review => 'Tinjauan',
            self::Rejected => 'Perlu Revisi',
            self::Scheduled => 'Terjadwal',
            self::Published => 'Terbit',
            self::Archived => 'Arsip',
        };
    }

    public function requiresPublishPermission(): bool
    {
        return $this === self::Scheduled || $this === self::Published || $this === self::Archived;
    }
}
