<?php

declare(strict_types=1);

use App\Enums\ArticlePackage;
use App\Models\Article;
use App\Models\Page;
use Inertia\Testing\AssertableInertia as Assert;

test('recently published paid stories are shared as ads on every public page', function () {
    $ad = Article::factory()->create(['package' => ArticlePackage::Branding, 'title' => 'Promo Toko Beresin']);
    Article::factory()->create(['title' => 'Berita biasa']);
    Article::factory()->draft()->create(['package' => ArticlePackage::General]);
    Article::factory()->create(['package' => ArticlePackage::General, 'published_at' => now()->subDays(31)]);
    $page = Page::factory()->create();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $inertia) => $inertia
            ->has('sponsoredArticles', 1)
            ->where('sponsoredArticles.0.title', 'Promo Toko Beresin')
            ->where('sponsoredArticles.0.label', 'Advertorial')
            ->where('sponsoredArticles.0.url', $ad->url(absolute: false)));

    $this->get($ad->url())->assertInertia(fn (Assert $inertia) => $inertia->has('sponsoredArticles', 1));
    $this->get(route('pages.show', $page->slug))->assertInertia(fn (Assert $inertia) => $inertia->has('sponsoredArticles', 1));
});
