<?php

declare(strict_types=1);

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\ArticleView;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/** @return array<string, int> */
function tileValues(Assert $page): array
{
    return collect($page->toArray()['props']['tiles'])->pluck('value', 'label')->all();
}

test('admins see site-wide tiles including users and newsletter', function () {
    $this->actingAs(User::factory()->admin()->create())->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('role', 'admin')
            ->where('heading.title', 'Dashboard Admin')
            ->has('tiles', 6)
            ->where('tiles.2.href', '/admin/tinjauan')
            ->where('tiles.5.popup', 'users')
            ->whereNot('latestUsers', null));
});

test('editors see the newsroom work queue without admin-only menus', function () {
    Article::factory()->draft()->create();

    $this->actingAs(User::factory()->editor()->create())->get(route('admin.dashboard'))
        ->assertInertia(function (Assert $page): void {
            $page->where('role', 'editor')->where('heading.title', 'Dashboard Redaktur')->where('latestUsers', null);

            $labels = array_keys(tileValues($page));
            expect($labels)->toContain('Draf redaksi', 'Breaking news tayang', 'Komentar menunggu')
                ->not->toContain('Jumlah pengguna', 'Pelanggan newsletter', 'Naskah menunggu tinjauan')
                ->and(tileValues($page)['Draf redaksi'])->toBe(1);
        });
});

test('writers only see numbers about their own articles', function () {
    $writer = User::factory()->writer()->create();
    $mine = Article::factory()->create(['author_id' => $writer->id, 'views_count' => 40]);
    Article::factory()->draft()->create(['author_id' => $writer->id]);
    Article::factory()->create(['author_id' => $writer->id, 'status' => ArticleStatus::Rejected]);
    $other = Article::factory()->create(['views_count' => 900]);
    Article::factory()->draft()->create();

    ArticleView::query()->create(['article_id' => $mine->id, 'session_hash' => 'a', 'viewed_at' => now()]);
    ArticleView::query()->create(['article_id' => $other->id, 'session_hash' => 'b', 'viewed_at' => now()]);
    ArticleView::query()->create(['article_id' => $other->id, 'session_hash' => 'c', 'viewed_at' => now()]);

    $this->actingAs($writer)->get(route('admin.dashboard'))
        ->assertInertia(function (Assert $page) use ($mine): void {
            $page->where('role', 'writer')
                ->where('latestUsers', null)
                ->has('popular', 1)
                ->where('popular.0.id', $mine->id)
                ->has('activity', 3);

            expect(tileValues($page))->toMatchArray([
                'Artikel saya terbit' => 1,
                'Views artikel saya 24 jam' => 1,
                'Total views artikel saya' => 40,
                'Draf saya' => 1,
                'Perlu revisi' => 1,
            ]);
        });
});
