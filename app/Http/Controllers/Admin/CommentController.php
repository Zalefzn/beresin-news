<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\SyncArticleCommentCount;
use App\Enums\CommentStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function __construct(private SyncArticleCommentCount $syncCount) {}

    public function index(Request $request): Response
    {
        Gate::authorize('moderate', Comment::class);

        $status = CommentStatus::tryFrom($request->string('status')->toString()) ?? CommentStatus::Pending;

        return Inertia::render('admin/comments/index', [
            'comments' => Comment::query()
                ->where('status', $status)
                ->with(['article.category'])
                ->latest()
                ->paginate(20)
                ->withQueryString()
                ->through(fn (Comment $comment): array => [
                    'id' => $comment->id,
                    'name' => $comment->name,
                    'email' => $comment->email,
                    'body' => $comment->body,
                    'status' => $comment->status->value,
                    'is_reply' => $comment->parent_id !== null,
                    'created_label' => $comment->created_at?->diffForHumans(),
                    'article_title' => $comment->article->title,
                    'article_url' => $comment->article->isPubliclyVisible() ? $comment->article->url() : null,
                ]),
            'status' => $status->value,
            'counts' => collect(CommentStatus::cases())
                ->mapWithKeys(fn (CommentStatus $case): array => [$case->value => Comment::query()->where('status', $case)->count()]),
        ]);
    }

    public function updateStatus(Request $request, Comment $comment): RedirectResponse
    {
        Gate::authorize('moderate', $comment);

        $data = $request->validate(['status' => ['required', Rule::enum(CommentStatus::class)]]);

        $this->applyStatus([$comment->id], CommentStatus::from($data['status']));

        Inertia::flash('success', 'Status komentar diperbarui.');

        return back();
    }

    public function bulk(Request $request): RedirectResponse
    {
        Gate::authorize('moderate', Comment::class);

        /** @var array{ids: list<int>, action: string} $data */
        $data = $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['integer', 'exists:comments,id'],
            'action' => ['required', Rule::in(['approved', 'rejected', 'spam', 'delete'])],
        ]);

        if ($data['action'] === 'delete') {
            $articleIds = Comment::query()->whereIn('id', $data['ids'])->pluck('article_id')->unique();
            Comment::query()->whereIn('id', $data['ids'])->delete();
            $this->syncArticles($articleIds->all());
        } else {
            $this->applyStatus($data['ids'], CommentStatus::from($data['action']));
        }

        Inertia::flash('success', 'Aksi massal berhasil dijalankan.');

        return back();
    }

    public function reply(Request $request, Comment $comment): RedirectResponse
    {
        Gate::authorize('moderate', $comment);

        /** @var User $user */
        $user = $request->user();
        $data = $request->validate(['body' => ['required', 'string', 'min:3', 'max:1000']], [], ['body' => 'balasan']);

        Comment::query()->create([
            'article_id' => $comment->article_id,
            'user_id' => $user->id,
            'parent_id' => $comment->parent_id ?? $comment->id,
            'name' => $user->name,
            'email' => $user->email,
            'body' => trim(strip_tags($data['body'])),
            'status' => CommentStatus::Approved,
            'ip_address' => $request->ip(),
        ]);

        $this->applyStatus([$comment->id], CommentStatus::Approved);

        Inertia::flash('success', 'Balasan terkirim dan komentar disetujui.');

        return back();
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        Gate::authorize('moderate', $comment);

        $articleId = $comment->article_id;
        $comment->delete();
        $this->syncArticles([$articleId]);

        Inertia::flash('success', 'Komentar dihapus.');

        return back();
    }

    /** @param list<int> $ids */
    private function applyStatus(array $ids, CommentStatus $status): void
    {
        Comment::query()->whereIn('id', $ids)->update(['status' => $status]);

        $this->syncArticles(Comment::query()->whereIn('id', $ids)->pluck('article_id')->unique()->all());
    }

    /** @param array<int, int> $articleIds */
    private function syncArticles(array $articleIds): void
    {
        foreach ($articleIds as $articleId) {
            $article = new Article;
            $article->id = $articleId;
            $this->syncCount->handle($article);
        }
    }
}
