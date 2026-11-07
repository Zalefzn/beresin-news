<?php

declare(strict_types=1);

use App\Enums\ArticlePackage;
use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\ArticleOrder;
use App\Models\Comment;
use App\Models\NewsletterSubscriber;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create(['name' => 'Admin Redaksi']);
});

test('users filter by account status', function () {
    User::factory()->create(['name' => 'Akun Mati', 'is_active' => false]);

    $this->actingAs($this->admin)->get(route('admin.users.index', ['status' => 'nonaktif']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Akun Mati')
            ->where('filters.status', 'nonaktif'));
});

test('tags filter by trending', function () {
    Tag::factory()->create(['name' => 'Pemilu', 'is_trending' => true]);
    Tag::factory()->create(['name' => 'Kuliner', 'is_trending' => false]);

    $this->actingAs($this->admin)->get(route('admin.tags.index', ['trending' => 'ya']))
        ->assertInertia(fn (Assert $page) => $page->has('tags.data', 1)->where('tags.data.0.name', 'Pemilu'));

    $this->actingAs($this->admin)->get(route('admin.tags.index', ['trending' => 'tidak']))
        ->assertInertia(fn (Assert $page) => $page->has('tags.data', 1)->where('tags.data.0.name', 'Kuliner'));
});

test('orders filter by search text and package', function () {
    ArticleOrder::factory()->create(['article_id' => Article::factory()->draft()->create(['title' => 'Peluncuran Kopi Lokal'])]);
    ArticleOrder::factory()->create(['package' => ArticlePackage::Branding]);

    $this->actingAs($this->admin)->get(route('admin.orders.index', ['q' => 'Kopi']))
        ->assertInertia(fn (Assert $page) => $page->has('orders.data', 1)->where('orders.data.0.article_title', 'Peluncuran Kopi Lokal'));

    $this->actingAs($this->admin)->get(route('admin.orders.index', ['paket' => 'branding']))
        ->assertInertia(fn (Assert $page) => $page->has('orders.data', 1)->where('orders.data.0.package_label', ArticlePackage::Branding->label()));
});

test('reviews filter by package, including internal articles', function () {
    Article::factory()->create(['status' => ArticleStatus::Review, 'package' => null, 'title' => 'Naskah Jurnalis']);
    Article::factory()->create(['status' => ArticleStatus::Review, 'package' => ArticlePackage::General, 'title' => 'Naskah Pembaca']);

    $this->actingAs($this->admin)->get(route('admin.reviews.index', ['paket' => 'internal']))
        ->assertInertia(fn (Assert $page) => $page->has('articles.data', 1)->where('articles.data.0.title', 'Naskah Jurnalis'));

    $this->actingAs($this->admin)->get(route('admin.reviews.index', ['paket' => 'umum', 'q' => 'Pembaca']))
        ->assertInertia(fn (Assert $page) => $page->has('articles.data', 1)->where('articles.data.0.title', 'Naskah Pembaca'));
});

test('comments filter by search text within the status tab', function () {
    Comment::factory()->pending()->create(['body' => 'Artikel yang sangat informatif']);
    Comment::factory()->pending()->create(['body' => 'Kurang lengkap']);

    $this->actingAs($this->admin)->get(route('admin.comments.index', ['status' => 'pending', 'q' => 'informatif']))
        ->assertInertia(fn (Assert $page) => $page->has('comments.data', 1)->where('filters.q', 'informatif'));
});

test('newsletter subscribers filter by status', function () {
    NewsletterSubscriber::factory()->confirmed()->create(['email' => 'aktif@example.com']);
    NewsletterSubscriber::factory()->create(['email' => 'menunggu@example.com']);
    NewsletterSubscriber::factory()->confirmed()->create(['email' => 'berhenti@example.com', 'unsubscribed_at' => now()]);

    foreach (['aktif' => 'aktif@example.com', 'menunggu' => 'menunggu@example.com', 'berhenti' => 'berhenti@example.com'] as $status => $email) {
        $this->actingAs($this->admin)->get(route('admin.newsletter.index', ['status' => $status]))
            ->assertInertia(fn (Assert $page) => $page->has('subscribers.data', 1)->where('subscribers.data.0.email', $email));
    }
});
