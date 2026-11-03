<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TvProgramFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A null day_of_week means the program airs every day.
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property string|null $hosts
 * @property int|null $day_of_week
 * @property string $starts_at
 * @property string $ends_at
 */
#[Fillable(['title', 'description', 'hosts', 'day_of_week', 'starts_at', 'ends_at'])]
class TvProgram extends Model
{
    /** @use HasFactory<TvProgramFactory> */
    use HasFactory;

    /**
     * @param  Builder<TvProgram>  $query
     * @return Builder<TvProgram>
     */
    public function scopeForDay(Builder $query, DateTimeInterface $day): Builder
    {
        return $query
            ->where(fn (Builder $inner) => $inner->whereNull('day_of_week')->orWhere('day_of_week', (int) $day->format('w')))
            ->orderBy('starts_at');
    }

    public function isOnAirAt(DateTimeInterface $moment): bool
    {
        $time = $moment->format('H:i:s');

        return $this->normalizedTime($this->starts_at) <= $time && $time < $this->normalizedTime($this->ends_at);
    }

    private function normalizedTime(string $time): string
    {
        return strlen($time) === 5 ? $time.':00' : $time;
    }
}
