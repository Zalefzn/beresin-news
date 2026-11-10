<?php

declare(strict_types=1);

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function articlePayload(array $overrides = []): array
{
    return [
        'title' => 'Judul Artikel Baru',
        'slug' => '',
        'body' => '<p>Isi artikel.</p>',
        'category_id' => Category::factory()->create()->id,
        'status' => 'draft',
        ...$overrides,
    ];
}

test('a writer can save a draft and submit for review', function () {
    $writer = User::factory()->writer()->create();

    $this->actingAs($writer)->post(route('admin.articles.store'), articlePayload())->assertRedirect();

    $article = Article::query()->firstOrFail();
    expect($article->author_id)->toBe($writer->id)
        ->and($article->slug)->toBe('judul-artikel-baru')
        ->and($article->status)->toBe(ArticleStatus::Draft);

    $this->actingAs($writer)->put(route('admin.articles.update', $article), articlePayload(['status' => 'review']))->assertSessionHasNoErrors();
    expect($article->fresh()->status)->toBe(ArticleStatus::Review);
});

test('a writer publishes directly without a review or payment', function () {
    $writer = User::factory()->writer()->create();

    $this->actingAs($writer)->get(route('admin.articles.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('canPublish', true)
            ->where('canFeature', false)
            ->where('defaultStatus', 'published')
            ->where('statuses', fn ($statuses): bool => $statuses->pluck('value')->intersect(['review', 'rejected'])->isEmpty()));

    $this->actingAs(User::factory()->editor()->create())->get(route('admin.articles.create'))
        ->assertInertia(fn (Assert $page) => $page->where('defaultStatus', 'draft'));

    $this->actingAs($writer)
        ->post(route('admin.articles.store'), articlePayload(['status' => 'published']))
        ->assertSessionHasNoErrors();

    $article = Article::query()->firstOrFail();
    expect($article->isPubliclyVisible())->toBeTrue()
        ->and($article->package)->toBeNull()
        ->and($article->orders()->count())->toBe(0);
});

test('an editor cannot publish or schedule', function (string $status) {
    $user = User::factory()->editor()->create();

    $this->actingAs($user)->get(route('admin.articles.create'))
        ->assertInertia(fn (Assert $page) => $page->where('canPublish', false));

    $this->actingAs($user)
        ->post(route('admin.articles.store'), articlePayload(['status' => $status, 'published_at' => now()->addDay()->toDateTimeString()]))
        ->assertSessionHasErrors('status');

    expect(Article::query()->count())->toBe(0);
})->with(['published', 'scheduled', 'archived']);

test('a writer cannot set headline flags through the request', function () {
    $writer = User::factory()->writer()->create();

    $this->actingAs($writer)->post(route('admin.articles.store'), articlePayload(['is_headline' => true, 'is_breaking' => true]));

    expect(Article::query()->firstOrFail())->is_headline->toBeFalse()->is_breaking->toBeFalse();
});

test('a writer can only touch their own articles', function () {
    $writer = User::factory()->writer()->create();
    $foreign = Article::factory()->draft()->create();
    $ownPublished = Article::factory()->create(['author_id' => $writer->id]);

    $this->actingAs($writer)->get(route('admin.articles.edit', $foreign))->assertForbidden();
    $this->actingAs($writer)->put(route('admin.articles.update', $foreign), articlePayload())->assertForbidden();
    $this->actingAs($writer)->delete(route('admin.articles.destroy', $foreign))->assertForbidden();
    $this->actingAs($writer)->get(route('admin.articles.edit', $ownPublished))->assertOk();
});

test('the article list shows writers only their own work', function () {
    $writer = User::factory()->writer()->create();
    Article::factory()->draft()->create(['author_id' => $writer->id]);
    Article::factory()->draft()->create();

    $this->actingAs($writer)->get(route('admin.articles.index'))
        ->assertInertia(fn (Assert $page) => $page->component('admin/articles/index')->has('articles.data', 1));

    $this->actingAs(User::factory()->editor()->create())->get(route('admin.articles.index'))
        ->assertInertia(fn (Assert $page) => $page->has('articles.data', 2));
});

test('the admin can publish, feature and tag an article', function () {
    $editor = User::factory()->admin()->create();
    Tag::factory()->create(['name' => 'Lama', 'slug' => 'lama']);

    $this->actingAs($editor)->post(route('admin.articles.store'), articlePayload([
        'status' => 'published',
        'is_headline' => true,
        'tags' => ['Lama', 'Tag Baru', '#Tag Baru'],
    ]))->assertSessionHasNoErrors();

    $article = Article::query()->with('tags')->firstOrFail();

    expect($article->isPubliclyVisible())->toBeTrue()
        ->and($article->is_headline)->toBeTrue()
        ->and($article->editor_id)->toBe($editor->id)
        ->and($article->tags->pluck('slug')->sort()->values()->all())->toBe(['lama', 'tag-baru']);
});

test('the article body is sanitized when saved', function () {
    $this->actingAs(User::factory()->editor()->create())->post(route('admin.articles.store'), articlePayload([
        'body' => '<p onclick="steal()">Aman</p><script>steal()</script><img src="x" onerror="steal()">',
    ]));

    expect(Article::query()->firstOrFail()->body)
        ->not->toContain('script')
        ->not->toContain('onclick')
        ->not->toContain('onerror')
        ->toContain('Aman');
});

test('scheduling requires a future date and the scheduler publishes it', function () {
    $editor = User::factory()->admin()->create();

    $this->actingAs($editor)
        ->post(route('admin.articles.store'), articlePayload(['status' => 'scheduled']))
        ->assertSessionHasErrors('published_at');

    $this->actingAs($editor)
        ->post(route('admin.articles.store'), articlePayload(['status' => 'scheduled', 'published_at' => now()->subHour()->toDateTimeString()]))
        ->assertSessionHasErrors('published_at');

    $due = Article::factory()->create(['status' => ArticleStatus::Scheduled, 'published_at' => now()->subMinute()]);
    $future = Article::factory()->scheduled()->create();

    $this->artisan('articles:publish-scheduled')->assertSuccessful();

    expect($due->fresh()->status)->toBe(ArticleStatus::Published)
        ->and($future->fresh()->status)->toBe(ArticleStatus::Scheduled);
});

test('autosave stores text of drafts and refuses published articles', function () {
    $writer = User::factory()->writer()->create();
    $draft = Article::factory()->draft()->create(['author_id' => $writer->id]);

    $this->actingAs($writer)
        ->putJson(route('admin.articles.autosave', $draft), ['title' => 'Judul Autosave', 'body' => '<p>Isi</p><script>x</script>'])
        ->assertOk();

    expect($draft->fresh())->title->toBe('Judul Autosave')->body->not->toContain('script')->status->toBe(ArticleStatus::Draft);

    $published = Article::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->putJson(route('admin.articles.autosave', $published), ['title' => 'Ubah'])
        ->assertStatus(409);
});

test('deleting is a soft delete', function () {
    $article = Article::factory()->create();

    $this->actingAs(User::factory()->admin()->create())->delete(route('admin.articles.destroy', $article));

    $this->assertSoftDeleted($article);
});

test('image uploads accept images only', function () {
    Storage::fake('public');
    $writer = User::factory()->writer()->create();

    $this->actingAs($writer)
        ->postJson(route('admin.articles.upload-image'), ['image' => UploadedFile::fake()->image('foto.jpg')])
        ->assertOk()
        ->assertJsonStructure(['url']);

    $this->actingAs($writer)
        ->postJson(route('admin.articles.upload-image'), ['image' => UploadedFile::fake()->create('jahat.php', 10, 'application/x-php')])
        ->assertUnprocessable();
});

test('cover photos up to 10 MB are accepted and larger ones are refused', function () {
    Storage::fake('public');
    $writer = User::factory()->writer()->create();

    $this->actingAs($writer)
        ->post(route('admin.articles.store'), articlePayload(['cover' => UploadedFile::fake()->image('sampul.jpg')->size(8 * 1024)]))
        ->assertSessionHasNoErrors();

    $this->actingAs($writer)
        ->post(route('admin.articles.store'), articlePayload(['title' => 'Artikel Lain', 'cover' => UploadedFile::fake()->image('besar.jpg')->size(11 * 1024)]))
        ->assertSessionHasErrors('cover');
});

test('the keep-alive ping refreshes a signed-in session only', function () {
    $this->get(route('session.keep-alive'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->writer()->create())
        ->get(route('session.keep-alive'))
        ->assertNoContent();
});
