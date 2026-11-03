<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SyncBookmarksRequest;
use App\Http\Resources\ArticleCardResource;
use App\Models\Article;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    private const int PER_PAGE = 20;

    private const int DRAWER_SIZE = 5;

    private const int MAX_GUEST_IDS = 100;

    /**
     * Guests pass their locally stored ids through ?ids=1,2,3.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $articles = $user
            ? $user->bookmarkedArticles()->published()->forCard()->orderByPivot('created_at', 'desc')->paginate(self::PER_PAGE)
            : Article::query()->published()->forCard()
                ->whereIn('id', $this->guestIds($request))
                ->latest('published_at')
                ->paginate(self::PER_PAGE)
                ->withQueryString();

        return Inertia::render('bookmarks/index', [
            'articles' => ArticleCardResource::collection($articles),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $articles = $user
            ? $user->bookmarkedArticles()->published()->forCard()->orderByPivot('created_at', 'desc')->limit(self::DRAWER_SIZE)->get()
            : Article::query()->published()->forCard()->whereIn('id', $this->guestIds($request))->latest('published_at')->limit(self::DRAWER_SIZE)->get();

        return response()->json(ArticleCardResource::collection($articles)->resolve($request));
    }

    public function toggle(Request $request, Article $article): RedirectResponse
    {
        abort_unless($article->isPubliclyVisible(), 404);

        /** @var User $user */
        $user = $request->user();
        $user->bookmarkedArticles()->toggle([$article->id]);

        return back();
    }

    public function sync(SyncBookmarksRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var list<int> $ids */
        $ids = $request->validated('ids');
        $existing = Article::query()->published()->whereIn('id', $ids)->pluck('id')->all();
        $user->bookmarkedArticles()->syncWithoutDetaching($existing);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->bookmarkedArticles()->detach();

        Inertia::flash('success', 'Semua simpanan berita dibersihkan');

        return back();
    }

    /** @return array<int, int> */
    private function guestIds(Request $request): array
    {
        return collect(explode(',', $request->string('ids')->toString()))
            ->map(fn (string $id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->take(self::MAX_GUEST_IDS)
            ->values()
            ->all();
    }
}
