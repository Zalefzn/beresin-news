<?php

declare(strict_types=1);

use App\Actions\GetSharedSiteData;
use App\Models\Article;
use App\Models\Category;
use App\Models\Video;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia as Assert;

test('seeded navigation carries the merged categories', function () {
    Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\DatabaseSeeder']);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('navCategories', 4)
        ->where('navCategories.0.name', 'Teknologi')
        ->where('navCategories.1.name', 'Edukasi & Pendidikan')
        ->where('navCategories.2.name', 'Ekonomi')
        ->where('navCategories.3.name', 'Sosial & Politik')
    );
});

test('old category addresses redirect permanently', function (string $old, string $new) {
    $this->get("/kategori/{$old}")->assertStatus(301)->assertRedirect("/kategori/{$new}");
})->with([
    ['teknologi-edukasi-pendidikan', 'teknologi'],
    ['ekonomi-sosial-politik', 'ekonomi'],
    ['ai-masa-depan', 'teknologi'],
    ['gadget', 'teknologi'],
    ['nasional', 'sosial-politik'],
]);

test('old article addresses redirect to the merged category', function () {
    $category = Category::factory()->create(['slug' => 'ekonomi']);
    $article = Article::factory()->create(['category_id' => $category->id, 'slug' => 'rupiah-menguat']);

    $this->get('/ekonomi-sosial-politik/rupiah-menguat')->assertStatus(301)->assertRedirect($article->url());
});

test('retired categories hand their content over and leave the navigation', function () {
    $technology = Category::factory()->create(['slug' => 'teknologi-edukasi-pendidikan']);
    $society = Category::factory()->create(['slug' => 'ekonomi-sosial-politik']);
    $gadget = Category::factory()->create(['slug' => 'gadget']);
    $national = Category::factory()->create(['slug' => 'nasional']);

    $gadgetArticle = Article::factory()->create(['category_id' => $gadget->id]);
    $trashedArticle = Article::factory()->create(['category_id' => $gadget->id]);
    $trashedArticle->delete();
    $nationalArticle = Article::factory()->create(['category_id' => $national->id, 'slug' => 'berita-nasional']);
    $video = Video::factory()->create(['category_id' => $national->id]);

    (require database_path('migrations/2026_11_04_000300_consolidate_categories.php'))->up();

    expect($gadgetArticle->fresh()->category_id)->toBe($technology->id)
        ->and($trashedArticle->fresh()->category_id)->toBe($technology->id)
        ->and($nationalArticle->fresh()->category_id)->toBe($society->id)
        ->and($video->fresh()->category_id)->toBe($society->id)
        ->and($gadget->fresh()->is_active)->toBeFalse()
        ->and($national->fresh()->is_active)->toBeFalse();

    GetSharedSiteData::flush();

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->has('navCategories', 2));
    $this->get('/nasional/berita-nasional')->assertStatus(301)->assertRedirect($nationalArticle->fresh()->url());
});

test('merged categories split into four, keeping their articles', function () {
    $technology = Category::factory()->create(['slug' => 'teknologi-edukasi-pendidikan']);
    $economy = Category::factory()->create(['slug' => 'ekonomi-sosial-politik']);
    $technologyArticle = Article::factory()->create(['category_id' => $technology->id]);
    $economyArticle = Article::factory()->create(['category_id' => $economy->id]);
    $sample = Article::factory()->create(['category_id' => $economy->id, 'slug' => 'mobil-otonom-uji-coba-jakarta']);

    (require database_path('migrations/2026_11_04_000400_split_navigation_categories.php'))->up();

    expect(Category::query()->active()->pluck('name')->all())
        ->toBe(['Teknologi', 'Edukasi & Pendidikan', 'Ekonomi', 'Sosial & Politik'])
        ->and($technologyArticle->fresh()->category->slug)->toBe('teknologi')
        ->and($economyArticle->fresh()->category->slug)->toBe('ekonomi')
        ->and($sample->fresh()->category->slug)->toBe('sosial-politik');

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->has('navCategories', 4));
});
