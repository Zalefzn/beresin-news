<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Category;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

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

test('the www host redirects permanently to the canonical domain', function () {
    config(['app.url' => 'https://beresinnews.com']);

    $this->get('https://www.beresinnews.com/kategori/teknologi?urut=terbaru')
        ->assertStatus(301)
        ->assertRedirect('https://beresinnews.com/kategori/teknologi?urut=terbaru');
});

test('the google verification code is printed once an admin sets it', function () {
    $this->get(route('home'))->assertDontSee('google-site-verification', false);

    Setting::query()->create(['key' => 'google_site_verification', 'value' => 'AbC123_xyz-9']);

    $this->get(route('home'))->assertSee('<meta name="google-site-verification" content="AbC123_xyz-9">', false);
});

test('the google verification code only accepts the content value', function () {
    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        'site_name' => 'BeresinNews',
        'weather_city' => 'Jakarta',
        'weather_temp' => '29°C',
        'google_site_verification' => '<meta name="google-site-verification" content="abc">',
    ])->assertSessionHasErrors('google_site_verification');
});

test('the home page describes the site and its social profiles for search engines', function () {
    Setting::query()->create(['key' => 'social', 'value' => ['instagram' => 'https://www.instagram.com/beresinnews', 'tiktok' => '']]);

    $this->get(route('home'))->assertInertia(function (Assert $page): void {
        $graph = json_decode($page->toArray()['props']['jsonLd'], true)['@graph'];

        expect($graph[0]['@type'])->toBe('WebSite')
            ->and($graph[1]['@type'])->toBe('NewsMediaOrganization')
            ->and($graph[1]['sameAs'])->toBe(['https://www.instagram.com/beresinnews']);
    });
});
