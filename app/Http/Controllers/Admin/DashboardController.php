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
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const int CHART_DAYS = 30;

    public function __invoke(GetPopularArticles $popularArticles): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'publishedToday' => Article::query()->published()->where('published_at', '>=', today())->count(),
                'views24h' => ArticleView::query()->where('viewed_at', '>=', now()->subDay())->count(),
                'pendingComments' => Comment::query()->where('status', CommentStatus::Pending)->count(),
                'subscribers' => NewsletterSubscriber::query()->active()->count(),
                'pendingReviews' => Article::query()->where('status', ArticleStatus::Review)->count(),
            ],
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
