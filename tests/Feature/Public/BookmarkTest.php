<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a user can toggle a bookmark', function () {
    $user = User::factory()->create();
    $article = Article::factory()->create();

    $this->actingAs($user)->post(route('bookmarks.toggle', $article));
    expect($user->bookmarkedArticles()->count())->toBe(1);

    $this->actingAs($user)->post(route('bookmarks.toggle', $article));
    expect($user->bookmarkedArticles()->count())->toBe(0);
});

test('guests cannot write bookmarks to the server', function () {
    $this->post(route('bookmarks.toggle', Article::factory()->create()))->assertRedirect(route('login'));
});

test('guests see articles from the ids they pass, published only', function () {
    $published = Article::factory()->create();
    $draft = Article::factory()->draft()->create();

    $this->get(route('bookmarks.index', ['ids' => "{$published->id},{$draft->id},abc"]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('bookmarks/index')
            ->has('articles.data', 1)
            ->where('articles.data.0.id', $published->id)
        );
});

test('local bookmarks sync into the account after login', function () {
    $user = User::factory()->create();
    $articles = Article::factory()->count(2)->create();
    $draft = Article::factory()->draft()->create();

    $this->actingAs($user)->post(route('bookmarks.sync'), ['ids' => [...$articles->pluck('id'), $draft->id]])->assertRedirect();

    expect($user->bookmarkedArticles()->pluck('articles.id')->sort()->values()->all())
        ->toBe($articles->pluck('id')->sort()->values()->all());
});

test('saved ids are shared and clearing removes them', function () {
    $user = User::factory()->create();
    $article = Article::factory()->create();
    $user->bookmarkedArticles()->attach($article);

    $this->actingAs($user)->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('savedIds', [$article->id]));

    $this->actingAs($user)->delete(route('bookmarks.clear'));

    expect($user->bookmarkedArticles()->count())->toBe(0);
});

test('the summary returns five saved articles at most', function () {
    $user = User::factory()->create();
    $user->bookmarkedArticles()->attach(Article::factory()->count(6)->create());

    $this->actingAs($user)->getJson(route('bookmarks.summary'))->assertOk()->assertJsonCount(5);
});
