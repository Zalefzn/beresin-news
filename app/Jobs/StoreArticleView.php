<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Article;
use App\Models\ArticleView;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class StoreArticleView implements ShouldQueue
{
    use Queueable;

    private const int UNIQUE_WINDOW_MINUTES = 30;

    public function __construct(public int $articleId, public string $sessionHash) {}

    public function handle(): void
    {
        $alreadyCounted = ArticleView::query()
            ->where('article_id', $this->articleId)
            ->where('session_hash', $this->sessionHash)
            ->where('viewed_at', '>=', now()->subMinutes(self::UNIQUE_WINDOW_MINUTES))
            ->exists();

        if ($alreadyCounted) {
            return;
        }

        DB::transaction(function (): void {
            ArticleView::query()->create([
                'article_id' => $this->articleId,
                'session_hash' => $this->sessionHash,
                'viewed_at' => now(),
            ]);

            Article::query()->whereKey($this->articleId)->increment('views_count');
        });
    }
}
