<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var array<string, array{string, string, string}> */
    private const array MERGED = [
        'teknologi' => ['Teknologi, Edukasi & Pendidikan', 'teknologi-edukasi-pendidikan', 'Teknologi digital, internet, edukasi, dan dunia pendidikan.'],
        'ekonomi' => ['Ekonomi, Sosial & Politik', 'ekonomi-sosial-politik', 'Ekonomi, bisnis, isu sosial, dan politik.'],
    ];

    public function up(): void
    {
        foreach (self::MERGED as $oldSlug => [$name, $slug, $description]) {
            DB::table('categories')->where('slug', $oldSlug)->update([
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('categories')->where('slug', 'teknologi-edukasi-pendidikan')->update(['name' => 'Teknologi', 'slug' => 'teknologi']);
        DB::table('categories')->where('slug', 'ekonomi-sosial-politik')->update(['name' => 'Ekonomi', 'slug' => 'ekonomi']);
    }
};
