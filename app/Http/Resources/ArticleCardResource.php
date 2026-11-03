<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Article
 */
class ArticleCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'url' => $this->url(),
            'image' => $this->coverUrl('card'),
            'image_thumb' => $this->coverUrl('thumb'),
            'image_hero' => $this->coverUrl('hero'),
            'srcset' => $this->coverSrcset(),
            'category' => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'color' => $this->category->color,
            ],
            'author' => [
                'name' => $this->author->name,
                'slug' => $this->author->slug,
            ],
            'published_at' => $this->published_at?->toIso8601String(),
            'published_label' => $this->published_at?->translatedFormat('j M Y'),
            'reading_time' => $this->reading_time,
            'views_count' => $this->views_count,
            'paid_label' => $this->package?->publicLabel(),
        ];
    }
}
