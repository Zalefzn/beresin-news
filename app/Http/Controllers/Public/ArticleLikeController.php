<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\RecordArticleView;
use App\Actions\ToggleArticleLike;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ArticleLikeController extends Controller
{
    public function store(Request $request, Article $article, ToggleArticleLike $likes, RecordArticleView $views): RedirectResponse
    {
        abort_unless($article->isPubliclyVisible(), 404);

        $likes->like($article, $request->user(), $views->sessionHash($request));

        return back();
    }
}
