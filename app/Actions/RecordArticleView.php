<?php

declare(strict_types=1);

namespace App\Actions;

use App\Jobs\StoreArticleView;
use App\Models\Article;
use Illuminate\Http\Request;

class RecordArticleView
{
    private const string BOT_PATTERN = '/bot|crawl|slurp|spider|mediapartners|facebookexternalhit|whatsapp|telegram|preview|lighthouse/i';

    public function handle(Article $article, Request $request): void
    {
        if ($this->isBot($request)) {
            return;
        }

        StoreArticleView::dispatch($article->id, $this->sessionHash($request));
    }

    public function sessionHash(Request $request): string
    {
        return hash('sha256', $request->session()->getId().config('app.key'));
    }

    private function isBot(Request $request): bool
    {
        $userAgent = (string) $request->userAgent();

        return $userAgent === '' || preg_match(self::BOT_PATTERN, $userAgent) === 1;
    }
}
