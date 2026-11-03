<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\ReviewArticle;
use App\Enums\ArticleStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    private const int PER_PAGE = 15;

    public function index(): Response
    {
        Gate::authorize('publish', Article::class);

        return Inertia::render('admin/reviews/index', [
            'articles' => Article::query()
                ->where('status', ArticleStatus::Review)
                ->with(['category', 'author', 'orders'])
                ->oldest('updated_at')
                ->paginate(self::PER_PAGE)
                ->through(fn (Article $article): array => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'excerpt' => $article->excerpt,
                    'category' => $article->category->name,
                    'author' => $article->author->name,
                    'package_label' => $article->package?->label() ?? 'Internal (gratis)',
                    'amount' => $article->orders->firstWhere('status', OrderStatus::Paid)?->amount,
                    'is_paid' => $article->hasPaidOrder(),
                    'submitted_label' => $article->updated_at?->diffForHumans(),
                    'preview_url' => route('articles.preview', $article->preview_token),
                ]),
        ]);
    }

    public function approve(Request $request, Article $article, ReviewArticle $review): RedirectResponse
    {
        Gate::authorize('publish', Article::class);

        if ($article->package !== null && ! $article->hasPaidOrder()) {
            Inertia::flash('error', 'Naskah berbayar ini belum lunas, jadi belum bisa diterbitkan.');

            return back();
        }

        $review->approve($article, $this->admin($request));

        Inertia::flash('success', 'Naskah disetujui dan telah terbit.');

        return back();
    }

    public function reject(Request $request, Article $article, ReviewArticle $review): RedirectResponse
    {
        Gate::authorize('publish', Article::class);

        /** @var array{reason: string} $data */
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:1000']], [], ['reason' => 'alasan penolakan']);

        $review->reject($article, $this->admin($request), trim(strip_tags($data['reason'])));

        Inertia::flash('success', 'Naskah ditolak dan penulis sudah diberi tahu.');

        return back();
    }

    private function admin(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
