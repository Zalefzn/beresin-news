<?php

declare(strict_types=1);

namespace App\Actions;

use App\Events\LiveViewerCountUpdated;
use App\Models\LiveStream;
use Illuminate\Support\Facades\Cache;

/**
 * Viewers send a heartbeat while watching. The count is the number of sessions seen recently.
 */
class RecordLiveViewer
{
    private const int ACTIVE_WINDOW_SECONDS = 60;

    public function handle(LiveStream $stream, string $sessionHash): int
    {
        $key = "live.{$stream->id}.viewers";

        $count = Cache::lock("{$key}.lock", 5)->block(3, function () use ($key, $sessionHash): int {
            /** @var array<string, int> $viewers */
            $viewers = Cache::get($key, []);
            $viewers[$sessionHash] = now()->getTimestamp();
            $threshold = now()->getTimestamp() - self::ACTIVE_WINDOW_SECONDS;
            $viewers = array_filter($viewers, fn (int $seenAt): bool => $seenAt >= $threshold);
            Cache::put($key, $viewers, self::ACTIVE_WINDOW_SECONDS * 2);

            return count($viewers);
        });

        if ($count !== $stream->viewer_count) {
            $stream->update(['viewer_count' => $count]);
            LiveViewerCountUpdated::dispatch($stream->id, $count);
        }

        return $count;
    }
}
