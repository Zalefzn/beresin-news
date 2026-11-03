<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Article;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection;

class GetPopularArticles
{
    /**
     * @return Collection<int, Article>
     */
    public function handle(DateTimeInterface $since, int $limit = 5, ?int $categoryId = null): Collection
    {
        return Article::query()
            ->published()
            ->forCard()
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->popularSince($since)
            ->limit($limit)
            ->get();
    }
}
