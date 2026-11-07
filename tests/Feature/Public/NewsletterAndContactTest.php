<?php

declare(strict_types=1);

use App\Mail\ContactMessageMail;
use App\Mail\NewsletterConfirmationMail;
use App\Models\NewsletterSubscriber;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

test('subscribing sends a double opt-in email', function () {
    Mail::fake();

    $this->post(route('newsletter.store'), ['email' => 'Pembaca@Example.com'])->assertRedirect();

    $subscriber = NewsletterSubscriber::query()->firstOrFail();

    expect($subscriber->email)->toBe('pembaca@example.com')->and($subscriber->confirmed_at)->toBeNull();
    Mail::assertQueued(NewsletterConfirmationMail::class);
});

test('a confirmed subscriber does not get another email', function () {
    Mail::fake();
    NewsletterSubscriber::factory()->confirmed()->create(['email' => 'lama@example.com']);

    $this->post(route('newsletter.store'), ['email' => 'lama@example.com'])->assertRedirect();

    Mail::assertNothingQueued();
});

test('an invalid email is rejected', function () {
    $this->post(route('newsletter.store'), ['email' => 'bukan-email'])
        ->assertSessionHasErrors(['email' => 'Format alamat email tidak valid.']);
});

test('confirm and unsubscribe links work by token', function () {
    $subscriber = NewsletterSubscriber::factory()->create();

    $this->get(route('newsletter.confirm', $subscriber->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('newsletter/confirmed'));
    expect($subscriber->fresh()->confirmed_at)->not->toBeNull();

    $this->get(route('newsletter.unsubscribe', $subscriber->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('newsletter/unsubscribed'));
    expect($subscriber->fresh()->unsubscribed_at)->not->toBeNull();

    $this->get(route('newsletter.confirm', 'token-salah'))->assertNotFound();
});

test('a contact message is queued to the newsroom inbox, not the public contact email', function () {
    Mail::fake();
    config(['services.newsroom.email' => 'redaksi@example.com']);
    Setting::query()->create(['key' => 'contact', 'value' => ['email' => 'publik@example.com']]);

    $this->post(route('contact.store'), [
        'name' => 'Budi',
        'email' => 'budi@example.com',
        'subject' => 'Redaksi',
        'message' => 'Pesan yang cukup panjang untuk redaksi.',
    ])->assertRedirect();

    Mail::assertQueued(ContactMessageMail::class, fn (ContactMessageMail $mail) => $mail->hasTo('redaksi@example.com'));
});

test('the contact form validates its fields', function () {
    $this->post(route('contact.store'), ['name' => '', 'email' => 'x', 'subject' => 'Lain', 'message' => 'pendek'])
        ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);
});
