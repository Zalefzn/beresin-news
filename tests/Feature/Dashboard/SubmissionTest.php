<?php

declare(strict_types=1);

use App\Enums\ArticlePackage;
use App\Enums\ArticleStatus;
use App\Enums\OrderStatus;
use App\Models\Article;
use App\Models\ArticleOrder;
use App\Models\Category;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config(['services.midtrans.server_key' => 'test-server-key', 'services.midtrans.is_production' => false]);
});

function submissionPayload(array $overrides = []): array
{
    return [
        'title' => 'Peluncuran Produk Lokal Terbaru di Jakarta',
        'excerpt' => 'Ringkasan berita pengguna.',
        'body' => '<p>Isi berita.</p><script>steal()</script>',
        'category_id' => Category::factory()->create()->id,
        'package' => 'umum',
        ...$overrides,
    ];
}

function fakeSnap(string $url = 'https://app.sandbox.midtrans.com/snap/v4/redirection/abc'): void
{
    Http::fake(['app.sandbox.midtrans.com/snap/v1/transactions' => Http::response(['token' => 'abc', 'redirect_url' => $url], 201)]);
}

function midtransPayload(ArticleOrder $order, string $status = 'settlement', array $overrides = []): array
{
    $payload = [
        'order_id' => $order->midtrans_order_id,
        'status_code' => '200',
        'gross_amount' => $order->amount.'.00',
        'transaction_status' => $status,
        'payment_type' => 'qris',
        ...$overrides,
    ];

    $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'test-server-key');

    return $payload;
}

function paidSubmission(User $author, ArticleStatus $status = ArticleStatus::Review): Article
{
    $article = Article::factory()->create(['author_id' => $author->id, 'status' => $status, 'published_at' => null, 'package' => ArticlePackage::General]);
    ArticleOrder::factory()->paid()->create(['article_id' => $article->id, 'user_id' => $author->id]);

    return $article;
}

test('guests and unverified users cannot submit news', function () {
    $this->get(route('submissions.create'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->unverified()->create())
        ->get(route('submissions.create'))
        ->assertRedirect(route('verification.notice'));
});

test('a saved submission stays a sanitized draft and asks for payment', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('submissions.store'), submissionPayload())->assertRedirect(route('submissions.index'));

    $article = Article::query()->firstOrFail();

    expect($article->status)->toBe(ArticleStatus::Draft)
        ->and($article->package)->toBe(ArticlePackage::General)
        ->and($article->author_id)->toBe($user->id)
        ->and($article->body)->not->toContain('script')
        ->and($article->isPubliclyVisible())->toBeFalse();

    Notification::assertSentTo($user, SubmissionNotification::class, fn ($notification) => $notification->title === 'Selesaikan pembayaran');
});

test('a submission cannot choose its own status or publication', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('submissions.store'), submissionPayload(['status' => 'published', 'published_at' => now()->toDateTimeString(), 'is_headline' => true]));

    expect(Article::query()->firstOrFail())
        ->status->toBe(ArticleStatus::Draft)
        ->published_at->toBeNull()
        ->is_headline->toBeFalse();
});

test('the order uses the price configured by the admin', function () {
    fakeSnap();
    Setting::query()->create(['key' => 'price_branding', 'value' => 75000]);
    $user = User::factory()->create();
    $article = Article::factory()->draft()->create(['author_id' => $user->id, 'package' => ArticlePackage::Branding]);

    $this->actingAs($user)->post(route('submissions.pay', $article))->assertRedirect('https://app.sandbox.midtrans.com/snap/v4/redirection/abc');

    $order = ArticleOrder::query()->firstOrFail();

    expect($order->amount)->toBe(75000)->and($order->status)->toBe(OrderStatus::Pending);
    Http::assertSent(fn ($request) => $request['transaction_details']['gross_amount'] === 75000);
});

test('default prices are 30 and 50 thousand and old orders keep their price', function () {
    fakeSnap();
    $user = User::factory()->create();
    $article = Article::factory()->draft()->create(['author_id' => $user->id, 'package' => ArticlePackage::General]);

    $this->actingAs($user)->post(route('submissions.pay', $article));
    expect(ArticleOrder::query()->firstOrFail()->amount)->toBe(30000);

    Setting::query()->create(['key' => 'price_general', 'value' => 45000]);

    expect(ArticleOrder::query()->firstOrFail()->amount)->toBe(30000);

    $this->actingAs($user)->post(route('submissions.pay', $article));
    expect(ArticleOrder::query()->latest('id')->firstOrFail()->amount)->toBe(45000);
});

test('a failing gateway keeps the draft and shows a friendly message', function () {
    Http::fake(['*' => Http::response(['error_messages' => ['Access denied']], 401)]);
    $user = User::factory()->create();
    $article = Article::factory()->draft()->create(['author_id' => $user->id, 'package' => ArticlePackage::General]);

    $this->actingAs($user)->post(route('submissions.pay', $article))->assertRedirect(route('submissions.index'));

    expect($article->fresh()->status)->toBe(ArticleStatus::Draft);
});

test('a valid paid webhook sends the article to admin review', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $article = Article::factory()->draft()->create(['package' => ArticlePackage::General]);
    $order = ArticleOrder::factory()->create(['article_id' => $article->id]);

    $this->postJson(route('midtrans.notification'), midtransPayload($order))->assertOk();

    expect($order->fresh()->status)->toBe(OrderStatus::Paid)
        ->and($order->fresh()->payment_type)->toBe('qris')
        ->and($article->fresh()->status)->toBe(ArticleStatus::Review)
        ->and($article->fresh()->isPubliclyVisible())->toBeFalse();

    Notification::assertSentTo($order->user, SubmissionNotification::class, fn ($notification) => $notification->title === 'Pembayaran diterima');
    Notification::assertSentTo($admin, SubmissionNotification::class, fn ($notification) => $notification->title === 'Naskah menunggu tinjauan');
});

test('the webhook rejects forged signatures and wrong amounts', function () {
    $article = Article::factory()->draft()->create(['package' => ArticlePackage::General]);
    $order = ArticleOrder::factory()->create(['article_id' => $article->id]);

    $this->postJson(route('midtrans.notification'), [...midtransPayload($order), 'signature_key' => 'palsu'])->assertForbidden();
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);

    $this->postJson(route('midtrans.notification'), midtransPayload($order, overrides: ['gross_amount' => '1000.00']))->assertOk();
    expect($order->fresh()->status)->toBe(OrderStatus::Pending)
        ->and($article->fresh()->status)->toBe(ArticleStatus::Draft);
});

test('the webhook is rejected when midtrans is not configured', function () {
    $article = Article::factory()->draft()->create(['package' => ArticlePackage::General]);
    $order = ArticleOrder::factory()->create(['article_id' => $article->id]);
    $payload = midtransPayload($order);

    config(['services.midtrans.server_key' => '']);

    $this->postJson(route('midtrans.notification'), $payload)->assertForbidden();
});

test('a repeated or late webhook changes nothing after payment', function () {
    Notification::fake();
    $article = Article::factory()->draft()->create(['package' => ArticlePackage::General]);
    $order = ArticleOrder::factory()->create(['article_id' => $article->id]);

    $this->postJson(route('midtrans.notification'), midtransPayload($order));
    $this->postJson(route('midtrans.notification'), midtransPayload($order));
    $this->postJson(route('midtrans.notification'), midtransPayload($order, 'expire', ['status_code' => '407']));

    expect($order->fresh()->status)->toBe(OrderStatus::Paid);
    Notification::assertSentToTimes($order->user, SubmissionNotification::class, 1);
});

test('expired and suspicious payments do not reach review', function (array $payloadArguments) {
    $article = Article::factory()->draft()->create(['package' => ArticlePackage::General]);
    $order = ArticleOrder::factory()->create(['article_id' => $article->id]);

    $this->postJson(route('midtrans.notification'), midtransPayload($order, ...$payloadArguments))->assertOk();

    expect($article->fresh()->status)->toBe(ArticleStatus::Draft);
})->with([
    'expired' => [['expire']],
    'pending' => [['pending']],
    'fraud challenge' => [['capture', ['fraud_status' => 'challenge']]],
]);

test('returning from midtrans checks the payment status', function () {
    Notification::fake();
    $user = User::factory()->create();
    $article = Article::factory()->draft()->create(['author_id' => $user->id, 'package' => ArticlePackage::General]);
    $order = ArticleOrder::factory()->create(['article_id' => $article->id, 'user_id' => $user->id]);

    Http::fake(['api.sandbox.midtrans.com/v2/*' => Http::response(midtransPayload($order))]);

    $this->actingAs($user)->get(route('submissions.finish', $article))->assertRedirect(route('submissions.index'));

    expect($article->fresh()->status)->toBe(ArticleStatus::Review);
});

test('authors only reach their own submissions and only while editable', function () {
    $author = User::factory()->create();
    $other = User::factory()->create();
    $draft = Article::factory()->draft()->create(['author_id' => $author->id, 'package' => ArticlePackage::General]);
    $inReview = paidSubmission($author);

    $this->actingAs($other)->get(route('submissions.edit', $draft))->assertForbidden();
    $this->actingAs($other)->post(route('submissions.pay', $draft))->assertForbidden();
    $this->actingAs($author)->get(route('submissions.edit', $inReview))->assertForbidden();
    $this->actingAs($author)->delete(route('submissions.destroy', $inReview))->assertForbidden();
});

test('a paid package cannot be swapped for a more expensive one', function () {
    $author = User::factory()->create();
    $article = paidSubmission($author, ArticleStatus::Rejected);

    $this->actingAs($author)->put(route('submissions.update', $article), submissionPayload(['package' => 'branding']));

    expect($article->fresh()->package)->toBe(ArticlePackage::General);
});

test('a rejected article can be revised and resubmitted without paying again', function () {
    Notification::fake();
    Http::fake();
    $admin = User::factory()->admin()->create();
    $author = User::factory()->create();
    $article = paidSubmission($author);

    $this->actingAs($admin)->post(route('admin.reviews.reject', $article), ['reason' => 'Sumber berita kurang jelas'])->assertRedirect();

    expect($article->fresh())->status->toBe(ArticleStatus::Rejected)->rejection_reason->toBe('Sumber berita kurang jelas');
    Notification::assertSentTo($author, SubmissionNotification::class, fn ($notification) => str_contains($notification->message, 'Sumber berita kurang jelas'));

    $this->actingAs($author)->post(route('submissions.resubmit', $article))->assertRedirect();

    expect($article->fresh())->status->toBe(ArticleStatus::Review)->rejection_reason->toBeNull();
    expect(ArticleOrder::query()->where('article_id', $article->id)->count())->toBe(1);
    Http::assertNothingSent();
});

test('an unpaid article cannot be resubmitted into review', function () {
    $author = User::factory()->create();
    $article = Article::factory()->create(['author_id' => $author->id, 'status' => ArticleStatus::Rejected, 'published_at' => null, 'package' => ArticlePackage::General]);

    $this->actingAs($author)->post(route('submissions.resubmit', $article));

    expect($article->fresh()->status)->toBe(ArticleStatus::Rejected);
});

test('only the admin can approve, and approval publishes with a disclosure label', function () {
    Notification::fake();
    $author = User::factory()->create();
    $article = paidSubmission($author);

    $this->actingAs($author)->post(route('admin.reviews.approve', $article))->assertForbidden();
    $this->actingAs(User::factory()->writer()->create())->post(route('admin.reviews.approve', $article))->assertForbidden();
    $this->actingAs(User::factory()->editor()->create())->post(route('admin.reviews.approve', $article))->assertForbidden();
    expect($article->fresh()->isPubliclyVisible())->toBeFalse();

    $this->actingAs(User::factory()->admin()->create())->post(route('admin.reviews.approve', $article))->assertRedirect();

    $article->refresh();
    expect($article->isPubliclyVisible())->toBeTrue();
    Notification::assertSentTo($author, SubmissionNotification::class, fn ($notification) => $notification->title === 'Berita Anda telah terbit');

    $this->get($article->url())->assertInertia(fn (Assert $page) => $page->where('article.paid_label', 'Konten Berbayar'));
});

test('an unpaid article cannot be approved or published through the admin form', function () {
    $admin = User::factory()->admin()->create();
    $article = Article::factory()->create(['status' => ArticleStatus::Review, 'published_at' => null, 'package' => ArticlePackage::General]);

    $this->actingAs($admin)->post(route('admin.reviews.approve', $article));
    expect($article->fresh()->status)->toBe(ArticleStatus::Review);

    $this->actingAs($admin)->put(route('admin.articles.update', $article), [
        'title' => $article->title,
        'body' => '<p>Isi</p>',
        'category_id' => $article->category_id,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
});

test('the review queue lists waiting articles for the admin only', function () {
    $author = User::factory()->create();
    paidSubmission($author);

    $this->actingAs(User::factory()->editor()->create())->get(route('admin.reviews.index'))->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())->get(route('admin.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/reviews/index')->has('articles.data', 1)->where('articles.data.0.is_paid', true));
});

test('staff cannot edit paid or live articles', function () {
    $editor = User::factory()->editor()->create();
    $paid = paidSubmission(User::factory()->create());
    $live = Article::factory()->create();

    $this->actingAs($editor)->get(route('admin.articles.edit', $paid))->assertForbidden();
    $this->actingAs($editor)->get(route('admin.articles.edit', $live))->assertForbidden();
});

test('editors can no longer publish and writers still go free through review', function () {
    $this->actingAs(User::factory()->editor()->create())->post(route('admin.articles.store'), [
        'title' => 'Berita internal baru',
        'body' => '<p>Isi</p>',
        'category_id' => Category::factory()->create()->id,
        'status' => 'published',
    ])->assertSessionHasErrors('status');

    $writer = User::factory()->writer()->create();
    $article = Article::factory()->review()->create(['author_id' => $writer->id]);

    $this->actingAs(User::factory()->admin()->create())->post(route('admin.reviews.approve', $article));

    expect($article->fresh()->isPubliclyVisible())->toBeTrue()
        ->and(ArticleOrder::query()->count())->toBe(0);
});

test('prices are editable by the admin only', function () {
    $settings = ['site_name' => 'BeresinNews', 'weather_city' => 'Jakarta', 'weather_temp' => '29°C', 'price_general' => 35000, 'price_branding' => 60000];

    $this->actingAs(User::factory()->editor()->create())->put(route('admin.settings.update'), $settings)->assertForbidden();

    $this->actingAs(User::factory()->admin()->create())->put(route('admin.settings.update'), $settings)->assertSessionHasNoErrors();

    expect(Setting::query()->where('key', 'price_general')->value('value'))->toBe(35000);

    $this->actingAs(User::factory()->create())->get(route('submissions.create'))
        ->assertInertia(fn (Assert $page) => $page->where('packages.0.price_label', 'Rp35.000')->where('packages.1.price_label', 'Rp60.000'));
});

test('a paid price below the gateway minimum is rejected but zero is allowed', function () {
    $admin = User::factory()->admin()->create();
    $settings = ['site_name' => 'BeresinNews', 'weather_city' => 'Jakarta', 'weather_temp' => '29°C', 'price_branding' => 50000];

    $this->actingAs($admin)->put(route('admin.settings.update'), [...$settings, 'price_general' => 500])
        ->assertSessionHasErrors('price_general');

    $this->actingAs($admin)->put(route('admin.settings.update'), [...$settings, 'price_general' => 0])
        ->assertSessionHasNoErrors();

    expect(Setting::query()->where('key', 'price_general')->value('value'))->toBe(0);
});

test('a free package skips Midtrans and goes straight to review', function () {
    Http::fake();
    Notification::fake();
    Setting::query()->create(['key' => 'price_general', 'value' => 0]);
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('submissions.create'))
        ->assertInertia(fn (Assert $page) => $page->where('packages.0.price_label', 'Gratis')->where('packages.0.is_free', true));

    $this->actingAs($user)->post(route('submissions.store'), submissionPayload(['pay_now' => true]))
        ->assertRedirect(route('submissions.index'));

    $article = Article::query()->firstOrFail();
    $order = ArticleOrder::query()->firstOrFail();

    expect($article->status)->toBe(ArticleStatus::Review)
        ->and($order->amount)->toBe(0)
        ->and($order->status)->toBe(OrderStatus::Paid);
    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'midtrans'));
    Notification::assertSentTo($admin, SubmissionNotification::class);
    Notification::assertNotSentTo($user, SubmissionNotification::class);
});

test('notifications are private and opening one marks it read', function () {
    $user = User::factory()->create();
    $article = Article::factory()->draft()->create(['author_id' => $user->id, 'package' => ArticlePackage::General]);
    $user->notifyNow(SubmissionNotification::paymentRequired($article, 'Rp30.000'), ['database']);
    $notification = $user->notifications()->firstOrFail();

    $this->actingAs($user)->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('unreadNotifications', 1));

    $this->actingAs(User::factory()->create())->get(route('notifications.open', $notification->id))->assertNotFound();

    $this->actingAs($user)->get(route('notifications.open', $notification->id))->assertRedirect(route('submissions.index'));
    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('a live payment asks midtrans to also notify this site without replacing the shared url', function () {
    fakeSnap();
    $user = User::factory()->create();
    $article = Article::factory()->draft()->create(['author_id' => $user->id, 'package' => ArticlePackage::General]);

    $this->actingAs($user)->post('https://beresinnews.com'.route('submissions.pay', $article, absolute: false));

    Http::assertSent(fn ($request) => str_contains($request->url(), 'snap/v1/transactions')
        && $request->header('X-Append-Notification') === ['https://beresinnews.com/midtrans/notifikasi']
        && ! $request->hasHeader('X-Override-Notification'));
});
