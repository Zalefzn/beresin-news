<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Old category slug => the category that takes over its content.
     *
     * @var array<string, string>
     */
    private const array TARGETS = [
        'ai-masa-depan' => 'teknologi-edukasi-pendidikan',
        'gadget' => 'teknologi-edukasi-pendidikan',
        'nasional' => 'ekonomi-sosial-politik',
    ];

    public function up(): void
    {
        foreach (self::TARGETS as $oldSlug => $targetSlug) {
            $oldId = DB::table('categories')->where('slug', $oldSlug)->value('id');
            $targetId = DB::table('categories')->where('slug', $targetSlug)->value('id');

            if ($oldId === null || $targetId === null) {
                continue;
            }

            DB::table('articles')->where('category_id', $oldId)->update(['category_id' => $targetId]);
            DB::table('videos')->where('category_id', $oldId)->update(['category_id' => $targetId]);
            DB::table('categories')->where('id', $oldId)->update(['is_active' => false]);
        }
    }

    /**
     * Reactivates the categories. Which article came from where is not recorded, so articles stay put.
     */
    public function down(): void
    {
        DB::table('categories')->whereIn('slug', array_keys(self::TARGETS))->update(['is_active' => true]);
    }
};
