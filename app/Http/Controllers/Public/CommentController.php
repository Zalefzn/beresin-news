<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\SubmitComment;
use App\Enums\CommentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreCommentRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Article $article, SubmitComment $submitComment): RedirectResponse
    {
        abort_unless($article->isPubliclyVisible(), 404);

        // A filled honeypot gets the normal response so bots learn nothing.
        if ($request->filled('website')) {
            Inertia::flash('success', 'Komentar Anda sedang ditinjau redaksi.');

            return back();
        }

        /** @var array{body: string, name?: string|null, email?: string|null, parent_id?: int|null} $data */
        $data = $request->safe()->only(['body', 'name', 'email', 'parent_id']);

        $comment = $submitComment->handle($article, $data, $request->user(), $request->ip());

        Inertia::flash('success', $comment->status === CommentStatus::Approved
            ? 'Komentar Anda telah dipublikasikan!'
            : 'Komentar Anda sedang ditinjau redaksi.');

        return back();
    }
}
