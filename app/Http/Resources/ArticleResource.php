<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full article for the detail page.
 *
 * @mixin Article
 */
class ArticleResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            ...(new ArticleCardResource($this->resource))->toArray($request),
            'body' => $this->bodyWithDateline(),
            'cover_caption' => $this->cover_caption,
            'cover_credit' => $this->cover_credit,
            'category' => new CategoryResource($this->category),
            'author' => new AuthorResource($this->author),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'published_full_label' => $this->published_at?->translatedFormat('j M Y, H:i').' WIB',
            'updated_at' => $this->updated_at?->toIso8601String(),
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
        ];
    }
}
