<?php

declare(strict_types=1);

use App\Actions\GetSharedSiteData;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Slug => name, color, description. The order is the order in the navigation.
     *
     * @var array<string, array{string, string, string}>
     */
    private const array CATEGORIES = [
        'teknologi' => ['Teknologi', 'bg-blue-600', 'Perkembangan teknologi digital, internet, dan inovasi.'],
        'edukasi-pendidikan' => ['Edukasi & Pendidikan', 'bg-purple-600', 'Edukasi dan perkembangan dunia pendidikan.'],
        'ekonomi' => ['Ekonomi', 'bg-emerald-600', 'Ekonomi, pasar, dan bisnis.'],
        'sosial-politik' => ['Sosial & Politik', 'bg-rose-600', 'Isu sosial, kebijakan publik, dan politik.'],
    ];

    /** @var array<string, string> */
    private const array RENAMED = [
        'teknologi-edukasi-pendidikan' => 'teknologi',
        'ekonomi-sosial-politik' => 'ekonomi',
    ];

    public function up(): void
    {
        // On a fresh database the seeder creates these categories instead.
        if (! DB::table('categories')->whereIn('slug', array_keys(self::RENAMED))->exists()) {
            return;
        }

        foreach (self::RENAMED as $oldSlug => $newSlug) {
            DB::table('categories')->where('slug', $oldSlug)->update(['slug' => $newSlug]);
        }

        $order = 0;

        foreach (self::CATEGORIES as $slug => [$name, $color, $description]) {
            DB::table('categories')->updateOrInsert(['slug' => $slug], [
                'name' => $name,
                'color' => $color,
                'description' => $description,
                'sort_order' => $order++,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]);
        }

        // The sample items that came from the former "Nasional" category belong here now.
        $society = DB::table('categories')->where('slug', 'sosial-politik')->value('id');
        DB::table('articles')->where('slug', 'mobil-otonom-uji-coba-jakarta')->update(['category_id' => $society]);
        DB::table('videos')->where('slug', 'uji-coba-mobil-listrik-otonom-di-tol-layang-mbz')->update(['category_id' => $society]);

        GetSharedSiteData::flush();
    }

    /**
     * Only the names return. The two new categories stay, because articles may already use them.
     */
    public function down(): void
    {
        foreach (self::RENAMED as $oldSlug => $newSlug) {
            DB::table('categories')->where('slug', $newSlug)->update(['slug' => $oldSlug]);
        }

        GetSharedSiteData::flush();
    }
};
