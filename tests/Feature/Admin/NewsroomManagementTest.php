<?php

declare(strict_types=1);

use App\Enums\CommentStatus;
use App\Enums\UserRole;
use App\Events\LiveChatMessageHidden;
use App\Jobs\SendNewsletterIssue;
use App\Models\Article;
use App\Models\BreakingNews;
use App\Models\Category;
use App\Models\Comment;
use App\Models\LiveChatMessage;
use App\Models\NewsletterSubscriber;
use App\Models\Page;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

test('approving a comment updates the article counter', function () {
    $article = Article::factory()->create();
    $comment = Comment::factory()->pending()->create(['article_id' => $article->id]);

    $this->actingAs(User::factory()->editor()->create())
        ->put(route('admin.comments.status', $comment), ['status' => 'approved']);

    expect($comment->fresh()->status)->toBe(CommentStatus::Approved)
        ->and($article->fresh()->comments_count)->toBe(1);
});

test('bulk moderation works and deleting syncs the counter', function () {
    $article = Article::factory()->create();
    $comments = Comment::factory()->count(2)->create(['article_id' => $article->id]);
    $article->update(['comments_count' => 2]);
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)->post(route('admin.comments.bulk'), ['ids' => $comments->pluck('id')->all(), 'action' => 'spam']);
    expect(Comment::query()->where('status', CommentStatus::Spam)->count())->toBe(2)
        ->and($article->fresh()->comments_count)->toBe(0);

    $this->actingAs($editor)->post(route('admin.comments.bulk'), ['ids' => $comments->pluck('id')->all(), 'action' => 'delete']);
    expect(Comment::query()->count())->toBe(0);
});

test('an editor reply is published and approves the original comment', function () {
    $comment = Comment::factory()->pending()->create();

    $this->actingAs(User::factory()->editor()->create())
        ->post(route('admin.comments.reply', $comment), ['body' => 'Terima kasih atas masukannya']);

    expect($comment->fresh()->status)->toBe(CommentStatus::Approved)
        ->and($comment->replies()->count())->toBe(1);
});

test('categories can be created, reordered and protected from deletion', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.categories.store'), ['name' => 'Olahraga Baru', 'slug' => '', 'color' => 'bg-teal-600', 'is_active' => true])->assertSessionHasNoErrors();
    $this->actingAs($admin)->post(route('admin.categories.store'), ['name' => 'Warna Liar', 'slug' => '', 'color' => 'bg-[url(x)]'])->assertSessionHasErrors('color');

    $first = Category::query()->where('slug', 'olahraga-baru')->firstOrFail();
    $second = Category::factory()->create(['sort_order' => 5]);

    $this->actingAs($admin)->put(route('admin.categories.reorder'), ['ids' => [$second->id, $first->id]]);
    expect($second->fresh()->sort_order)->toBe(0)->and($first->fresh()->sort_order)->toBe(1);

    Article::factory()->create(['category_id' => $first->id]);
    $this->actingAs($admin)->delete(route('admin.categories.destroy', $first));
    expect($first->fresh())->not->toBeNull();
});

test('changing a category refreshes the shared navigation cache', function () {
    $category = Category::factory()->create(['name' => 'Nama Lama']);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('navCategories.0.name', 'Nama Lama'));

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.categories.update', $category), [
        'name' => 'Nama Baru', 'slug' => $category->slug, 'color' => 'bg-blue-600', 'is_active' => true,
    ]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('navCategories.0.name', 'Nama Baru'));
});

test('breaking news respects its active window', function () {
    BreakingNews::factory()->create(['text' => 'Aktif']);
    BreakingNews::factory()->create(['text' => 'Kedaluwarsa', 'ends_at' => now()->subHour()]);
    BreakingNews::factory()->create(['text' => 'Belum mulai', 'starts_at' => now()->addHour()]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('breakingNews', 1)
        ->where('breakingNews.0.title', 'Aktif')
    );
});

test('moderators can hide chat messages and block users', function () {
    Event::fake([LiveChatMessageHidden::class]);
    $message = LiveChatMessage::factory()->create();
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)->delete(route('admin.live.chat.hide', $message));
    expect($message->fresh()->is_hidden)->toBeTrue();
    Event::assertDispatched(LiveChatMessageHidden::class);

    $this->actingAs($editor)->post(route('admin.live.chat.block', $message->user_id));
    expect(User::query()->findOrFail($message->user_id)->chat_blocked_at)->not->toBeNull();
});

test('program times are validated', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->post(route('admin.live.programs.store'), ['title' => 'Program', 'starts_at' => '13:00', 'ends_at' => '12:00'])
        ->assertSessionHasErrors('ends_at');
});

test('the newsletter is queued and exported as csv', function () {
    Queue::fake();
    $admin = User::factory()->admin()->create();
    NewsletterSubscriber::factory()->confirmed()->create(['email' => 'aktif@example.com']);

    $this->actingAs($admin)->post(route('admin.newsletter.send'), ['subject' => 'Edisi', 'body' => 'Isi buletin']);
    Queue::assertPushed(SendNewsletterIssue::class);

    $csv = $this->actingAs($admin)->get(route('admin.newsletter.export'))->assertOk()->streamedContent();
    expect($csv)->toContain('aktif@example.com');
});

test('static page content is sanitized', function () {
    $this->actingAs(User::factory()->admin()->create())->post(route('admin.pages.store'), [
        'title' => 'Tentang', 'slug' => 'tentang', 'body' => '<p>Halo</p><script>x</script>',
    ]);

    expect(Page::query()->firstOrFail()->body)->not->toContain('script');
});

test('admins manage users but cannot lock themselves out', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Jurnalis Baru', 'email' => 'jurnalis@example.com', 'slug' => '', 'password' => 'password', 'role' => 'writer', 'is_active' => true,
    ])->assertSessionHasNoErrors();

    $created = User::query()->where('email', 'jurnalis@example.com')->firstOrFail();
    expect($created->role)->toBe(UserRole::Writer)->and($created->slug)->toBe('jurnalis-baru');

    $this->actingAs($admin)->put(route('admin.users.update', $admin), [
        'name' => $admin->name, 'email' => $admin->email, 'slug' => 'admin', 'role' => 'reader', 'is_active' => true,
    ]);
    expect($admin->fresh()->role)->toBe(UserRole::Admin);

    $this->actingAs($admin)->delete(route('admin.users.destroy', $created));
    expect($created->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->delete(route('admin.users.destroy', $admin));
    expect($admin->fresh()->is_active)->toBeTrue();
});

test('settings are saved and reach the public site', function () {
    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        'site_name' => 'BeresinNews',
        'weather_city' => 'Bandung',
        'weather_temp' => '24°C',
        'social' => ['x' => 'https://x.com/beresin'],
        'contact' => ['email' => 'redaksi@example.com'],
    ])->assertSessionHasNoErrors();

    expect(Setting::query()->where('key', 'weather_city')->value('value'))->toBe('Bandung');

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('site.weatherCity', 'Bandung'));
});

test('the analytics code rejects anything but a measurement id', function () {
    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), [
        'site_name' => 'BeresinNews',
        'weather_city' => 'Jakarta',
        'weather_temp' => '29°C',
        'analytics_code' => '</script><script>steal()</script>',
    ])->assertSessionHasErrors('analytics_code');
});
