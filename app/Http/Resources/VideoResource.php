<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Video
 */
class VideoResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'url' => route('videos.show', $this->slug),
            'source_url' => $this->source_url,
            'thumbnail' => $this->thumbnail,
            'duration' => $this->duration,
            'description' => $this->description,
            'views_count' => $this->views_count,
            'published_at' => $this->published_at?->toIso8601String(),
            'published_label' => $this->published_at?->translatedFormat('j M Y'),
            'category' => $this->category ? ['name' => $this->category->name, 'slug' => $this->category->slug] : null,
        ];
    }
}
