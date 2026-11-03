<?php

declare(strict_types=1);

use App\Jobs\StoreArticleView;
use App\Models\Article;
use App\Models\ArticleView;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

test('a published article renders with its details', function () {
    $article = Article::factory()->create(['title' => 'Judul Artikel', 'dateline' => 'Jakarta', 'body' => '<p>Isi pertama.</p>']);

    $this->get($article->url())
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles/show')
            ->where('article.title', 'Judul Artikel')
            ->where('article.body', '<p><strong>JAKARTA</strong> — Isi pertama.</p>')
            ->missing('article.author.email')
            ->missing('related')
            ->where('isLiked', false)
            ->where('isPreview', false)
            ->has('jsonLd')
        );
});

test('draft, scheduled, review and deleted articles are not public', function (Article $article) {
    $this->get(route('articles.show', ['category' => $article->category->slug, 'article' => $article->slug]))->assertNotFound();
})->with([
    'draft' => fn () => Article::factory()->draft()->create(),
    'review' => fn () => Article::factory()->review()->create(),
    'scheduled' => fn () => Article::factory()->scheduled()->create(),
    'future date' => fn () => Article::factory()->create(['published_at' => now()->addHour()]),
    'deleted' => function () {
        $article = Article::factory()->create();
        $article->delete();

        return $article;
    },
]);

test('a wrong category slug redirects permanently to the canonical url', function () {
    $article = Article::factory()->create();
    $other = Category::factory()->create();

    $this->get(route('articles.show', ['category' => $other->slug, 'article' => $article->slug]))
        ->assertStatus(301)
        ->assertRedirect($article->url());
});

test('views count once per session within thirty minutes and ignore bots', function () {
    $article = Article::factory()->create();
    $sameSession = str_repeat('a', 40);

    foreach (range(1, 2) as $visit) {
        $this->withHeader('User-Agent', 'Mozilla/5.0 Chrome')
            ->withCookie(config('session.cookie'), $sameSession)
            ->get($article->url());
    }

    expect(ArticleView::query()->where('article_id', $article->id)->count())->toBe(1)
        ->and($article->fresh()->views_count)->toBe(1);

    Queue::fake();
    $this->withHeaders(['User-Agent' => 'Googlebot/2.1'])->get($article->url());
    Queue::assertNotPushed(StoreArticleView::class);
});

test('preview works for the author and editors only', function () {
    $author = User::factory()->writer()->create();
    $article = Article::factory()->draft()->create(['author_id' => $author->id]);
    $url = route('articles.preview', $article->preview_token);

    $this->get($url)->assertRedirect(route('login'));
    $this->actingAs(User::factory()->writer()->create())->get($url)->assertForbidden();
    $this->actingAs(User::factory()->create())->get($url)->assertForbidden();
    $this->actingAs($author)->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->where('isPreview', true));
    $this->actingAs(User::factory()->editor()->create())->get($url)->assertOk();
});

test('a reader can like an article only once per session', function () {
    $article = Article::factory()->create();

    $sameSession = str_repeat('a', 40);

    foreach (range(1, 2) as $attempt) {
        $this->withCookie(config('session.cookie'), $sameSession)->post(route('articles.like', $article))->assertRedirect();
    }

    expect($article->fresh()->likes_count)->toBe(1);
});

test('a signed in user can like once and unpublished articles cannot be liked', function () {
    $article = Article::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('articles.like', $article));
    $this->actingAs($user)->post(route('articles.like', $article));

    expect($article->fresh()->likes_count)->toBe(1);

    $this->post(route('articles.like', Article::factory()->draft()->create()))->assertNotFound();
});

test('reading time is calculated when saving', function () {
    $article = Article::factory()->create(['body' => '<p>'.str_repeat('kata ', 450).'</p>']);

    expect($article->reading_time)->toBe(3);
});
