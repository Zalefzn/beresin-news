<?php

declare(strict_types=1);

use App\Enums\CommentStatus;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('a new sign-up waits for approval without an email verification step', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();

    $this->post(route('register.store'), [
        'name' => 'Pembaca Baru',
        'email' => 'baru@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'baru@example.com')->firstOrFail();

    expect($user->approved_at)->toBeNull();
    Notification::assertSentTo($admin, SubmissionNotification::class, fn (SubmissionNotification $notification) => $notification->title === 'Pendaftar baru menunggu persetujuan');

    $this->get(route('dashboard'))->assertRedirect(route('account.pending'));
    $this->get(route('account.pending'))->assertInertia(fn (Assert $page) => $page
        ->component('auth/pending-approval')
        ->where('email', 'baru@example.com'));
});

test('an approved reader skips the waiting page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('account.pending'))
        ->assertRedirect(route('dashboard'));
});

test('newsroom staff never wait for approval', function () {
    $this->actingAs(User::factory()->writer()->pendingApproval()->create())
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('an admin approves a pending reader who is then notified', function () {
    Notification::fake();
    $reader = User::factory()->pendingApproval()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.users.index', ['status' => 'menunggu']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.id', $reader->id)
            ->where('users.data.0.is_pending', true));

    $this->post(route('admin.users.approve', $reader))->assertRedirect();

    expect($reader->fresh()->approved_at)->not->toBeNull();
    Notification::assertSentTo($reader, SubmissionNotification::class, fn (SubmissionNotification $notification) => $notification->title === 'Akun Anda telah disetujui');

    $this->actingAs($reader->fresh())->get(route('submissions.create'))->assertOk();
});

test('an admin rejects a pending reader, which deactivates the account', function () {
    $reader = User::factory()->pendingApproval()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.users.reject', $reader))
        ->assertRedirect();

    expect($reader->fresh())
        ->is_active->toBeFalse()
        ->approved_at->toBeNull();
});

test('only admins can approve or reject sign-ups', function () {
    $reader = User::factory()->pendingApproval()->create();

    $this->actingAs(User::factory()->editor()->create())
        ->post(route('admin.users.approve', $reader))
        ->assertForbidden();

    expect($reader->fresh()->approved_at)->toBeNull();
});

test('a comment from a reader awaiting approval goes to moderation', function () {
    $article = Article::factory()->create();

    $this->actingAs(User::factory()->pendingApproval()->create())
        ->post(route('comments.store', $article), ['body' => 'Komentar pertama saya']);

    expect(Comment::query()->firstOrFail()->status)->toBe(CommentStatus::Pending);
});
