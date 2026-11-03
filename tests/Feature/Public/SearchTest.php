<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Category;
use Inertia\Testing\AssertableInertia as Assert;

test('search finds published articles only', function () {
    $match = Article::factory()->create(['title' => 'Pusat Riset Kecerdasan Nusantara']);
    Article::factory()->create(['title' => 'Topik lain sama sekali', 'excerpt' => 'Tidak terkait', 'body' => '<p>Tidak terkait</p>']);
    Article::factory()->draft()->create(['title' => 'Draf Kecerdasan Rahasia']);

    $this->get(route('search.index', ['q' => 'Kecerdasan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('search/index')
            ->has('results.data', 1)
            ->where('results.data.0.id', $match->id)
        );
});

test('queries shorter than two characters are not searched', function () {
    Article::factory()->create(['title' => 'A']);

    $this->get(route('search.index', ['q' => 'A']))
        ->assertInertia(fn (Assert $page) => $page->where('results', null));
});

test('search can filter by category and date range', function () {
    $category = Category::factory()->create(['slug' => 'ekonomi']);
    Article::factory()->create(['title' => 'Rupiah menguat', 'category_id' => $category->id, 'published_at' => now()->subHour()]);
    Article::factory()->create(['title' => 'Rupiah melemah', 'category_id' => $category->id, 'published_at' => now()->subDays(10)]);
    Article::factory()->create(['title' => 'Rupiah kategori lain']);

    $this->get(route('search.index', ['q' => 'Rupiah', 'kategori' => 'ekonomi', 'rentang' => '24jam']))
        ->assertInertia(fn (Assert $page) => $page->has('results.data', 1)->where('results.data.0.title', 'Rupiah menguat'));
});

test('title matches rank above body matches when sorting by relevance', function () {
    $bodyMatch = Article::factory()->create(['title' => 'Berita umum', 'body' => '<p>Membahas baterai listrik</p>', 'published_at' => now()->subMinute()]);
    $titleMatch = Article::factory()->create(['title' => 'Baterai listrik nasional', 'published_at' => now()->subDay()]);

    $this->get(route('search.index', ['q' => 'baterai']))
        ->assertInertia(fn (Assert $page) => $page->where('results.data.0.id', $titleMatch->id)->where('results.data.1.id', $bodyMatch->id));
});

test('suggestions return titles as json', function () {
    Article::factory()->create(['title' => 'Starlink Generasi Tiga']);

    $this->getJson(route('search.suggestions', ['q' => 'Starlink']))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.title', 'Starlink Generasi Tiga');
});
