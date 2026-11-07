<?php

declare(strict_types=1);

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\EditorialGuidesSeeder;
use Database\Seeders\NewsroomSeeder;

test('the editorial guides are published once, under the admin, with substantial bodies', function () {
    foreach (NewsroomSeeder::CATEGORIES as [$name, $slug]) {
        Category::factory()->create(['name' => $name, 'slug' => $slug]);
    }
    $admin = User::factory()->admin()->create();

    $this->seed(EditorialGuidesSeeder::class);
    $this->seed(EditorialGuidesSeeder::class);

    $guides = Article::query()->with('category')->get();

    expect($guides)->toHaveCount(15)
        ->each(fn ($article) => $article->status->toBe(ArticleStatus::Published)
            ->author_id->toBe($admin->id)
            ->reading_time->toBeGreaterThanOrEqual(2))
        ->and($guides->every(fn (Article $article): bool => str_word_count(strip_tags($article->body)) >= 330))->toBeTrue()
        ->and($guides->pluck('category.slug')->unique()->sort()->values()->all())
        ->toBe(['edukasi-pendidikan', 'ekonomi', 'sosial-politik', 'teknologi']);
});
