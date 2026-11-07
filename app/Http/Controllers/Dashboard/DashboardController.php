<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const int RECENT_LIMIT = 5;

    public function __invoke(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->canAccessNewsroom()) {
            return redirect()->route('admin.dashboard');
        }

        $submissions = Article::query()
            ->where('author_id', $user->id)
            ->whereNotNull('package');

        return Inertia::render('dashboard', [
            'stats' => [
                'submissions' => (clone $submissions)->count(),
                'inReview' => (clone $submissions)->where('status', ArticleStatus::Review)->count(),
                'published' => (clone $submissions)->published()->count(),
                'bookmarks' => $user->bookmarkedArticles()->published()->count(),
                'comments' => Comment::query()->where('user_id', $user->id)->count(),
            ],
            'recentSubmissions' => $submissions
                ->latest('updated_at')
                ->limit(self::RECENT_LIMIT)
                ->get()
                ->map(fn (Article $article): array => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'status' => $article->status->value,
                    'status_label' => $article->status->label(),
                    'updated_label' => $article->updated_at?->diffForHumans(),
                ]),
            'recentBookmarks' => ArticleCardResource::collection(
                $user->bookmarkedArticles()
                    ->published()
                    ->forCard()
                    ->orderByPivot('created_at', 'desc')
                    ->limit(self::RECENT_LIMIT)
                    ->get(),
            ),
        ]);
    }
}
