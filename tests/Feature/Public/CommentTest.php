<?php

declare(strict_types=1);

use App\Enums\CommentStatus;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a guest comment waits for moderation and is not shown', function () {
    $article = Article::factory()->create();

    $this->post(route('comments.store', $article), [
        'name' => 'Budi',
        'email' => 'budi@example.com',
        'body' => 'Komentar yang cukup panjang',
    ])->assertRedirect();

    $comment = Comment::query()->firstOrFail();

    expect($comment->status)->toBe(CommentStatus::Pending)
        ->and($article->fresh()->comments_count)->toBe(0);

    $this->get($article->url())->assertInertia(fn (Assert $page) => $page->has('comments.data', 0));
});

test('a verified user comment is published immediately', function () {
    $article = Article::factory()->create();

    $this->actingAs(User::factory()->create(['name' => 'Siti']))
        ->post(route('comments.store', $article), ['body' => 'Komentar terverifikasi']);

    expect(Comment::query()->firstOrFail())
        ->status->toBe(CommentStatus::Approved)
        ->name->toBe('Siti')
        ->and($article->fresh()->comments_count)->toBe(1);
});

test('comment validation enforces the limits', function (array $data, string $field) {
    $article = Article::factory()->create();
    $valid = ['name' => 'Budi', 'email' => 'budi@example.com', 'body' => 'Komentar valid'];

    $this->post(route('comments.store', $article), [...$valid, ...$data])->assertSessionHasErrors($field);
})->with([
    'short name' => [['name' => 'B'], 'name'],
    'long name' => [['name' => str_repeat('a', 61)], 'name'],
    'missing email' => [['email' => ''], 'email'],
    'short body' => [['body' => 'ab'], 'body'],
    'long body' => [['body' => str_repeat('a', 1001)], 'body'],
]);

test('validation messages are in Indonesian', function () {
    $article = Article::factory()->create();

    $this->post(route('comments.store', $article), ['name' => 'Budi', 'email' => 'budi@example.com', 'body' => ''])
        ->assertSessionHasErrors(['body' => 'Komentar wajib diisi.']);
});

test('the honeypot silently drops bots', function () {
    $article = Article::factory()->create();

    $this->post(route('comments.store', $article), [
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'body' => 'Beli sekarang',
        'website' => 'https://spam.example',
    ])->assertRedirect();

    expect(Comment::query()->count())->toBe(0);
});

test('comment markup is stripped and the email stays private', function () {
    $article = Article::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('comments.store', $article), ['body' => '<script>alert(1)</script>Halo <b>semua</b>']);

    $this->get($article->url())->assertInertia(fn (Assert $page) => $page
        ->where('comments.data.0.body', 'alert(1)Halo semua')
        ->missing('comments.data.0.email')
        ->missing('comments.data.0.ip_address')
    );
});

test('replies are limited to one level and to the same article', function () {
    $article = Article::factory()->create();
    $root = Comment::factory()->create(['article_id' => $article->id]);
    $reply = Comment::factory()->create(['article_id' => $article->id, 'parent_id' => $root->id]);
    $elsewhere = Comment::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('comments.store', $article), ['body' => 'Balasan valid', 'parent_id' => $root->id])->assertSessionHasNoErrors();
    $this->actingAs($user)->post(route('comments.store', $article), ['body' => 'Terlalu dalam', 'parent_id' => $reply->id])->assertSessionHasErrors('parent_id');
    $this->actingAs($user)->post(route('comments.store', $article), ['body' => 'Artikel lain', 'parent_id' => $elsewhere->id])->assertSessionHasErrors('parent_id');
});

test('comments are rate limited to three per minute', function () {
    $article = Article::factory()->create();
    $user = User::factory()->create();

    foreach (range(1, 4) as $attempt) {
        $this->actingAs($user)->post(route('comments.store', $article), ['body' => "Komentar nomor {$attempt}"]);
    }

    expect(Comment::query()->count())->toBe(3);
});
