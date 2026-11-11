<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\ArticleStatus;
use App\Enums\CommentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleView;
use App\Models\BreakingNews;
use App\Models\Comment;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * One dashboard, three views: admins see the whole site, editors the newsroom work queue,
 * and writers only their own articles.
 */
class DashboardController extends Controller
{
    private const int CHART_DAYS = 30;

    private const int LATEST_USERS = 10;

    /** Users who joined within this many hours carry the "Baru" badge. */
    private const int NEW_USER_HOURS = 24;

    private const int POPULAR_LIMIT = 10;

    private const int ACTIVITY_LIMIT = 6;

    public function __invoke(Request $request): Response
    {
        /** @var User $viewer */
        $viewer = $request->user();
        $authorId = $viewer->role === UserRole::Writer ? $viewer->id : null;

        return Inertia::render('admin/dashboard', [
            'role' => $viewer->role->value,
            'heading' => $this->heading($viewer),
            'tiles' => match ($viewer->role) {
                UserRole::Admin => $this->adminTiles(),
                UserRole::Editor => $this->editorTiles(),
                default => $this->writerTiles($viewer),
            },
            // Emails are private, so only admins (who manage users) get the list.
            'latestUsers' => $viewer->isAdmin() ? $this->latestUsers() : null,
            'viewsChart' => Inertia::defer(fn (): array => $this->viewsChart($authorId)->all()),
            'popular' => $this->popular($authorId),
            'activity' => Article::query()
                ->with('author')
                ->when($authorId, fn (Builder $query) => $query->where('author_id', $authorId))
                ->latest('updated_at')
                ->limit(self::ACTIVITY_LIMIT)
                ->get()
                ->map(fn (Article $article): array => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'author' => $article->author->name,
                    'status' => $article->status->label(),
                    'time' => $article->updated_at?->diffForHumans(),
                    'edit_url' => $viewer->can('update', $article) ? route('admin.articles.edit', $article, false) : null,
                ]),
        ]);
    }

    /** @return array{title: string, description: string, popularTitle: string, activityTitle: string, chartTitle: string} */
    private function heading(User $viewer): array
    {
        return match ($viewer->role) {
            UserRole::Admin => [
                'title' => 'Dashboard Admin',
                'description' => 'Ringkasan seluruh aktivitas BeresinNews.',
                'popularTitle' => '5 Artikel Terpopuler',
                'activityTitle' => 'Aktivitas Terbaru',
                'chartTitle' => 'Kunjungan 30 Hari Terakhir',
            ],
            UserRole::Editor => [
                'title' => 'Dashboard Redaktur',
                'description' => 'Antrean kerja redaksi hari ini.',
                'popularTitle' => '5 Artikel Terpopuler',
                'activityTitle' => 'Aktivitas Redaksi',
                'chartTitle' => 'Kunjungan 30 Hari Terakhir',
            ],
            default => [
                'title' => 'Dashboard Jurnalis',
                'description' => "Halo {$viewer->name}, ini ringkasan artikel Anda.",
                'popularTitle' => 'Artikel Saya Terpopuler',
                'activityTitle' => 'Artikel Saya Terakhir Diubah',
                'chartTitle' => 'Kunjungan Artikel Saya 30 Hari Terakhir',
            ],
        };
    }

    /** @return list<array<string, mixed>> */
    private function adminTiles(): array
    {
        return [
            $this->tile('Artikel terbit hari ini', $this->publishedToday(), 'fa-newspaper', 'Lihat artikel', route('admin.articles.index', ['status' => 'published'])),
            $this->tile('Total kunjungan', $this->totalViews(), 'fa-users-viewfinder', 'Lihat per artikel', popup: 'popular'),
            $this->tile('Naskah menunggu tinjauan', Article::query()->where('status', ArticleStatus::Review)->count(), 'fa-clipboard-check', 'Tinjau naskah', route('admin.reviews.index')),
            $this->tile('Komentar menunggu', $this->pendingComments(), 'fa-comments', 'Moderasi', route('admin.comments.index', ['status' => 'pending'])),
            $this->tile('Pelanggan newsletter', NewsletterSubscriber::query()->active()->count(), 'fa-envelope', 'Lihat pelanggan', route('admin.newsletter.index', ['status' => 'aktif'])),
            $this->tile('Jumlah pengguna', User::query()->count(), 'fa-users', 'Lihat daftar', popup: 'users'),
        ];
    }

    /** @return list<array<string, mixed>> */
    private function editorTiles(): array
    {
        return [
            $this->tile('Artikel terbit hari ini', $this->publishedToday(), 'fa-newspaper', 'Lihat artikel', route('admin.articles.index', ['status' => 'published'])),
            $this->tile('Total kunjungan', $this->totalViews(), 'fa-users-viewfinder', 'Lihat per artikel', popup: 'popular'),
            $this->tile('Artikel menunggu review', Article::query()->where('status', ArticleStatus::Review)->count(), 'fa-hourglass-half', 'Lihat antrean', route('admin.articles.index', ['status' => 'review'])),
            $this->tile('Draf redaksi', Article::query()->where('status', ArticleStatus::Draft)->whereNull('package')->count(), 'fa-pencil', 'Lihat draf', route('admin.articles.index', ['status' => 'draft'])),
            $this->tile('Komentar menunggu', $this->pendingComments(), 'fa-comments', 'Moderasi', route('admin.comments.index', ['status' => 'pending'])),
            $this->tile('Breaking news tayang', BreakingNews::query()->active()->count(), 'fa-bolt', 'Kelola ticker', route('admin.breaking.index')),
        ];
    }

    /** @return list<array<string, mixed>> */
    private function writerTiles(User $writer): array
    {
        $own = fn (): Builder => Article::query()->where('author_id', $writer->id);
        $countByStatus = fn (ArticleStatus $status): int => $own()->where('status', $status)->count();

        return [
            $this->tile('Artikel saya terbit', $own()->published()->count(), 'fa-newspaper', 'Lihat artikel', route('admin.articles.index', ['status' => 'published'])),
            $this->tile('Total kunjungan artikel saya', $this->totalViews($writer->id), 'fa-users-viewfinder', 'Lihat per artikel', popup: 'popular'),
            $this->tile('Suka di artikel saya', (int) $own()->sum('likes_count'), 'fa-heart', 'Lihat artikel', route('admin.articles.index', ['status' => 'published'])),
            $this->tile('Draf saya', $countByStatus(ArticleStatus::Draft), 'fa-pencil', 'Lanjutkan menulis', route('admin.articles.index', ['status' => 'draft'])),
            $this->tile('Menunggu review', $countByStatus(ArticleStatus::Review), 'fa-hourglass-half', 'Lihat status', route('admin.articles.index', ['status' => 'review'])),
            $this->tile('Perlu revisi', $countByStatus(ArticleStatus::Rejected), 'fa-rotate-left', 'Perbaiki', route('admin.articles.index', ['status' => 'rejected'])),
        ];
    }

    /**
     * @param  'popular'|'users'|null  $popup
     * @return array{label: string, value: int, icon: string, action: string, href: string|null, popup: string|null}
     */
    private function tile(string $label, int $value, string $icon, string $action, ?string $href = null, ?string $popup = null): array
    {
        return [
            'label' => $label,
            'value' => $value,
            'icon' => $icon,
            'action' => $action,
            'href' => $href === null ? null : $this->relative($href),
            'popup' => $popup,
        ];
    }

    private function relative(string $url): string
    {
        return (string) str($url)->after(url('/'))->start('/');
    }

    private function publishedToday(): int
    {
        return Article::query()->published()->where('published_at', '>=', today())->count();
    }

    private function pendingComments(): int
    {
        return Comment::query()->where('status', CommentStatus::Pending)->count();
    }

    private function totalViews(?int $authorId = null): int
    {
        return (int) Article::query()
            ->when($authorId, fn (Builder $query) => $query->where('author_id', $authorId))
            ->sum('views_count');
    }

    /** @return Builder<ArticleView> */
    private function viewsQuery(?int $authorId): Builder
    {
        return ArticleView::query()->when(
            $authorId,
            fn (Builder $query) => $query->whereIn('article_id', Article::query()->select('id')->where('author_id', $authorId)),
        );
    }

    /**
     * Published articles ranked by all-time visits.
     *
     * @return Collection<int, array{id: int, title: string, url: string, category: string, views_total: int}>
     */
    private function popular(?int $authorId): Collection
    {
        return Article::query()
            ->published()
            ->with('category')
            ->when($authorId, fn (Builder $query) => $query->where('author_id', $authorId))
            ->orderByDesc('views_count')
            ->latest('published_at')
            ->limit(self::POPULAR_LIMIT)
            ->get()
            ->map(fn (Article $article): array => [
                'id' => $article->id,
                'title' => $article->title,
                'url' => $article->url(absolute: false),
                'category' => $article->category->name,
                'views_total' => $article->views_count,
            ])
            ->toBase();
    }

    /**
     * @return Collection<int, array{id: int, name: string, email: string, role_label: string, is_active: bool, is_pending: bool, is_new: bool, joined: string|null, joined_at: string|null}>
     */
    private function latestUsers(): Collection
    {
        return User::query()
            ->latest('created_at')
            ->latest('id')
            ->limit(self::LATEST_USERS)
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_label' => $user->role->label(),
                'is_active' => $user->is_active,
                'is_pending' => $user->is_active && ! $user->isApproved(),
                'is_new' => $user->created_at?->gte(now()->subHours(self::NEW_USER_HOURS)) ?? false,
                'joined' => $user->created_at?->diffForHumans(),
                'joined_at' => $user->created_at?->toIso8601String(),
            ]);
    }

    /**
     * Counted in PHP so that the date grouping stays in WIB on every database driver.
     *
     * @return Collection<int, array{date: string, label: string, views: int}>
     */
    private function viewsChart(?int $authorId): Collection
    {
        $start = today()->subDays(self::CHART_DAYS - 1);

        $counts = $this->viewsQuery($authorId)
            ->where('viewed_at', '>=', $start)
            ->pluck('viewed_at')
            ->countBy(fn ($viewedAt): string => $viewedAt->format('Y-m-d'));

        return collect(range(0, self::CHART_DAYS - 1))->map(function (int $offset) use ($start, $counts): array {
            $day = $start->addDays($offset);

            return [
                'date' => $day->toDateString(),
                'label' => $day->translatedFormat('j M'),
                'views' => (int) $counts->get($day->toDateString(), 0),
            ];
        });
    }
}
