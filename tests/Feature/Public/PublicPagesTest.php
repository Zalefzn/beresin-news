<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Category;
use App\Models\LiveStream;
use App\Models\Page;
use App\Models\Tag;
use App\Models\User;
use App\Models\Video;
use Inertia\Testing\AssertableInertia as Assert;

test('home page renders the news portal props', function () {
    Article::factory()->headline()->create(['title' => 'Berita Utama Hari Ini']);
    Article::factory()->count(2)->create(['is_trending' => true]);
    Video::factory()->create();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('headline.title', 'Berita Utama Hari Ini')
            ->has('trending', 2)
            ->has('articles.data', 3)
            ->has('videos', 1)
            ->where('liveStream', null)
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
    'live' => ['live.index', [], 'live/index'],
    'videos' => ['videos.index', [], 'videos/index'],
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

test('static page and video detail render', function () {
    $staticPage = Page::factory()->create(['slug' => 'tentang-kami']);
    $video = Video::factory()->create();

    $this->get(route('pages.show', $staticPage->slug))->assertOk()->assertInertia(fn (Assert $page) => $page->component('pages/show'));
    $this->get(route('videos.show', $video->slug))->assertOk()->assertInertia(fn (Assert $page) => $page->component('videos/show'));
    expect($video->fresh()->views_count)->toBe($video->views_count + 1);
});

test('unpublished videos return 404', function () {
    $video = Video::factory()->create(['published_at' => null]);

    $this->get(route('videos.show', $video->slug))->assertNotFound();
});

test('live page shows an active broadcast or the offline state', function () {
    $this->get(route('live.index'))->assertInertia(fn (Assert $page) => $page->where('liveStream', null));

    LiveStream::factory()->create(['title' => 'Siaran Tes']);

    $this->get(route('live.index'))->assertInertia(fn (Assert $page) => $page->where('liveStream.title', 'Siaran Tes'));
});

test('unknown pages render the Indonesian error page with the latest news', function () {
    Article::factory()->count(5)->create();

    $this->get('/halaman/tidak-ada')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('errors/error')->where('status', 404)->has('latest', 4));
});
