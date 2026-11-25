<?php

declare(strict_types=1);

use App\Enums\ArticlePackage;
use App\Models\Article;
use App\Models\Page;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('stories the admin runs as ads are shared on every public page until their run ends', function () {
    $paidAd = Article::factory()->sponsored(now()->addWeek())->create(['package' => ArticlePackage::Branding, 'title' => 'Promo Toko Beresin']);
    Article::factory()->sponsored()->create(['title' => 'Iklan klien langsung', 'published_at' => now()->subDays(2)]);
    Article::factory()->create(['package' => ArticlePackage::General, 'title' => 'Berbayar tapi iklannya dimatikan']);
    Article::factory()->sponsored(now()->subDay())->create(['title' => 'Masa tayang habis']);
    Article::factory()->draft()->sponsored()->create();
    $page = Page::factory()->create();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->has('sponsoredArticles', 2)
            ->where('sponsoredArticles.0.title', 'Promo Toko Beresin')
            ->where('sponsoredArticles.0.label', 'Advertorial')
            ->where('sponsoredArticles.0.url', $paidAd->url(absolute: false))
            ->where('sponsoredArticles.1.title', 'Iklan klien langsung')
            ->where('sponsoredArticles.1.label', 'Advertorial'));

    $this->get($paidAd->url())->assertInertia(fn (Assert $inertia) => $inertia->has('sponsoredArticles', 2));
    $this->get(route('pages.show', $page->slug))->assertInertia(fn (Assert $inertia) => $inertia->has('sponsoredArticles', 2));
});

test('only the admin can turn a story into an ad and set when it stops', function () {
    $article = Article::factory()->create();
    $payload = [
        'title' => $article->title,
        'slug' => $article->slug,
        'body' => '<p>Isi</p>',
        'category_id' => $article->category_id,
        'status' => 'published',
        'is_sponsored' => true,
        'sponsored_until' => now()->addDays(10)->format('Y-m-d'),
    ];

    $this->actingAs(User::factory()->editor()->create())->put(route('admin.articles.update', $article), $payload);
    expect($article->fresh()->is_sponsored)->toBeFalse();

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->put(route('admin.articles.update', $article), $payload)->assertSessionHasNoErrors()->assertRedirect(route('admin.articles.index'));

    $article->refresh();
    expect($article->isSponsoredNow())->toBeTrue()
        ->and($article->sponsored_until->toDateTimeString())->toBe(now()->addDays(10)->endOfDay()->toDateTimeString());

    $this->actingAs($admin)->get(route('admin.articles.index', ['iklan' => 'tayang']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 1)
            ->where('articles.data.0.sponsor_label', 'Iklan s.d. '.now()->addDays(10)->translatedFormat('j M Y')));

    $this->actingAs($admin)->put(route('admin.articles.update', $article), [...$payload, 'is_sponsored' => false])->assertSessionHasNoErrors();
    expect($article->fresh()->isSponsoredNow())->toBeFalse();
});
