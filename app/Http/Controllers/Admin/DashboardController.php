<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\GetPopularArticles;
use App\Enums\ArticleStatus;
use App\Enums\CommentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Models\Article;
use App\Models\ArticleView;
use App\Models\Comment;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const int CHART_DAYS = 30;

    private const int LATEST_USERS = 10;

    private const int NEW_USER_DAYS = 7;

    public function __invoke(Request $request, GetPopularArticles $popularArticles): Response
    {
        /** @var User $viewer */
        $viewer = $request->user();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'publishedToday' => Article::query()->published()->where('published_at', '>=', today())->count(),
                'views24h' => ArticleView::query()->where('viewed_at', '>=', now()->subDay())->count(),
                'pendingComments' => Comment::query()->where('status', CommentStatus::Pending)->count(),
                'subscribers' => NewsletterSubscriber::query()->active()->count(),
                'pendingReviews' => Article::query()->where('status', ArticleStatus::Review)->count(),
                'users' => User::query()->count(),
            ],
            // Emails are private, so only admins (who manage users) get the list.
            'latestUsers' => $viewer->isAdmin() ? $this->latestUsers() : null,
            'viewsChart' => Inertia::defer(fn (): array => $this->viewsChart()->all()),
            'popular' => ArticleCardResource::collection($popularArticles->handle(now()->subDay())),
            'activity' => Article::query()->with('author')->latest('updated_at')->limit(6)->get()
                ->map(fn (Article $article): array => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'author' => $article->author->name,
                    'status' => $article->status->label(),
                    'time' => $article->updated_at?->diffForHumans(),
                ]),
        ]);
    }

    /**
     * @return Collection<int, array{id: int, name: string, email: string, role_label: string, is_active: bool, is_new: bool, joined: string|null, joined_at: string|null}>
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
                'is_new' => $user->created_at?->gte(now()->subDays(self::NEW_USER_DAYS)) ?? false,
                'joined' => $user->created_at?->diffForHumans(),
                'joined_at' => $user->created_at?->toIso8601String(),
            ]);
    }

    /**
     * Counted in PHP so that the date grouping stays in WIB on every database driver.
     *
     * @return Collection<int, array{date: string, label: string, views: int}>
     */
    private function viewsChart(): Collection
    {
        $start = today()->subDays(self::CHART_DAYS - 1);

        $counts = ArticleView::query()
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
