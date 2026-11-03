<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Writer = 'writer';
    case Reader = 'reader';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Editor => 'Redaktur',
            self::Writer => 'Jurnalis',
            self::Reader => 'Pembaca',
        };
    }

    public function canAccessNewsroom(): bool
    {
        return $this !== self::Reader;
    }

    public function canManageNewsroom(): bool
    {
        return $this === self::Admin || $this === self::Editor;
    }
}
