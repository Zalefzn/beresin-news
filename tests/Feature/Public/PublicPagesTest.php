<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Category;
use App\Models\Page;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('home page renders the news portal props', function () {
    Article::factory()->headline()->create(['title' => 'Berita Utama Hari Ini']);
    Article::factory()->count(2)->create(['is_trending' => true]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('headline.title', 'Berita Utama Hari Ini')
            ->has('trending', 2)
            ->has('articles.data', 3)
            ->missing('popular')
            ->has('navCategories')
            ->has('site')
        );
});

test('home feed filters by category and sorts by popularity', function () {
    $tech = Category::factory()->create(['slug' => 'teknologi']);
    Article::factory()->create(['category_id' => $tech->id, 'views_count' => 5, 'title' => 'Sedikit dibaca']);
    Article::factory()->create(['category_id' => $tech->id, 'views_count' => 500, 'title' => 'Banyak dibaca']);
    Article::factory()->create();

    $this->get(route('home', ['kategori' => 'teknologi', 'urut' => 'terpopuler']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 2)
            ->where('articles.data.0.title', 'Banyak dibaca')
            ->where('filters.urut', 'terpopuler')
        );
});

test('the home feed is ordered by publication date, not id', function () {
    $newer = Article::factory()->create(['published_at' => now()->subMinute()]);
    Article::factory()->create(['published_at' => now()->subDay()]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('articles.data.0.id', $newer->id));
});

test('public listing pages render', function (string $routeName, array $parameters, string $component) {
    $this->get(route($routeName, $parameters))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'index' => ['articles.index', [], 'articles/index'],
    'popular' => ['articles.popular', [], 'articles/popular'],
    'contact' => ['contact.show', [], 'contact/index'],
    'search' => ['search.index', [], 'search/index'],
    'bookmarks' => ['bookmarks.index', [], 'bookmarks/index'],
]);

test('category page shows its articles and hides inactive categories', function () {
    $category = Category::factory()->create();
    Article::factory()->count(3)->create(['category_id' => $category->id]);
    $inactive = Category::factory()->create(['is_active' => false]);

    $this->get(route('categories.show', $category->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('categories/show')->has('articles.data', 2)->has('featured'));

    $this->get(route('categories.show', $inactive->slug))->assertNotFound();
    $this->get(route('categories.show', 'tidak-ada'))->assertNotFound();
});

test('tag page uses the tag relation rather than the title', function () {
    $tag = Tag::factory()->create(['name' => 'Starlink3', 'slug' => 'starlink3']);
    $tagged = Article::factory()->create(['title' => 'Tanpa kata kunci']);
    $tagged->tags()->attach($tag);
    Article::factory()->create(['title' => 'Starlink3 di judul saja']);

    $this->get(route('tags.show', 'starlink3'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('tags/show')
            ->has('articles.data', 1)
            ->where('articles.data.0.id', $tagged->id)
        );
});

test('author profile never exposes the email address', function () {
    $author = User::factory()->writer()->create(['slug' => 'rian', 'email' => 'rahasia@example.com']);
    Article::factory()->create(['author_id' => $author->id]);

    $response = $this->get(route('authors.show', 'rian'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('authors/show')->missing('author.email'));
    expect($response->getContent())->not->toContain('rahasia@example.com');
});

test('static page renders', function () {
    $staticPage = Page::factory()->create(['slug' => 'tentang-kami']);

    $this->get(route('pages.show', $staticPage->slug))->assertOk()->assertInertia(fn (Assert $page) => $page->component('pages/show'));
});

test('unknown pages render the Indonesian error page with the latest news', function () {
    Article::factory()->count(5)->create();

    $this->get('/halaman/tidak-ada')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('errors/error')->where('status', 404)->has('latest', 4));
});

test('cached shared links do not depend on the host that built the cache', function () {
    Tag::factory()->create(['slug' => 'starlink', 'is_trending' => true]);

    $this->get('http://127.0.0.1/')->assertOk();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('trendingTags.0.url', '/tag/starlink')
        );
});
