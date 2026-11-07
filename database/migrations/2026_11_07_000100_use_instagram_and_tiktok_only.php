<?php

declare(strict_types=1);

use App\Actions\GetSharedSiteData;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var array<string, string> */
    private const array SOCIAL = [
        'instagram' => 'https://www.instagram.com/beresinnews',
        'tiktok' => 'https://www.tiktok.com/@beresinnews',
    ];

    /**
     * Live TV and video were dropped; the footer now links only Instagram and TikTok.
     */
    public function up(): void
    {
        // On a fresh database the seeder writes these settings instead.
        if (! DB::table('settings')->exists()) {
            return;
        }

        DB::table('settings')->updateOrInsert(
            ['key' => 'social'],
            ['value' => json_encode(self::SOCIAL), 'updated_at' => now()],
        );

        DB::table('settings')->whereIn('key', ['live_quality', 'live_studio'])->delete();

        GetSharedSiteData::flush();
    }

    public function down(): void
    {
        //
    }
};
