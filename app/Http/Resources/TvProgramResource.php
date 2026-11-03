<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\TvProgram;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TvProgram
 */
class TvProgramResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(?Request $request = null): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'hosts' => $this->hosts,
            'day_of_week' => $this->day_of_week,
            'starts_at' => substr($this->starts_at, 0, 5),
            'ends_at' => substr($this->ends_at, 0, 5),
            'is_now' => $this->isOnAirAt(now()),
        ];
    }
}
