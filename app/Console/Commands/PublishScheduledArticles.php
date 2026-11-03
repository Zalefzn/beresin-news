<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\PublishArticle;
use App\Enums\ArticleStatus;
use App\Models\Article;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('articles:publish-scheduled')]
#[Description('Menerbitkan artikel terjadwal yang sudah waktunya tayang')]
class PublishScheduledArticles extends Command
{
    public function handle(PublishArticle $publishArticle): int
    {
        $articles = Article::query()
            ->where('status', ArticleStatus::Scheduled)
            ->where('published_at', '<=', now())
            ->get();

        $articles->each(fn (Article $article) => $publishArticle->handle($article));

        $this->info("{$articles->count()} artikel diterbitkan.");

        return self::SUCCESS;
    }
}
