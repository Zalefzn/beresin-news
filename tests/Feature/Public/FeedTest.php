<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Category;

test('rss and sitemaps list published articles only', function (string $url) {
    $article = Article::factory()->create(['title' => 'Berita Tayang']);
    $draft = Article::factory()->draft()->create(['title' => 'Draf Rahasia']);

    $response = $this->get($url)->assertOk();

    expect($response->getContent())
        ->toContain($article->slug)
        ->not->toContain($draft->slug);
})->with(['/rss', '/sitemap.xml', '/sitemap-news.xml']);

test('the news sitemap only covers the last 48 hours', function () {
    $old = Article::factory()->create(['published_at' => now()->subHours(49)]);

    expect($this->get('/sitemap-news.xml')->getContent())->not->toContain($old->slug);
});

test('category rss returns only that category', function () {
    $category = Category::factory()->create();
    $inside = Article::factory()->create(['category_id' => $category->id]);
    $outside = Article::factory()->create();

    expect($this->get(route('feeds.rss.category', $category->slug))->assertOk()->getContent())
        ->toContain($inside->slug)
        ->not->toContain($outside->slug);
});

test('robots.txt points to the sitemaps and blocks private areas', function () {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertSee('Disallow: /admin')
        ->assertSee(route('feeds.sitemap'));
});
