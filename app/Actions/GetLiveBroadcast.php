<?php

declare(strict_types=1);

namespace App\Actions;

use App\Http\Resources\LiveChatMessageResource;
use App\Http\Resources\TvProgramResource;
use App\Models\LiveChatMessage;
use App\Models\LiveStream;
use App\Models\TvProgram;

class GetLiveBroadcast
{
    private const int CHAT_HISTORY_LIMIT = 50;

    public function __construct(private GetSharedSiteData $site) {}

    /**
     * @return array<string, mixed>|null Null when nothing is on air.
     */
    public function handle(): ?array
    {
        $stream = LiveStream::query()->where('is_live', true)->latest('updated_at')->first();

        if ($stream === null) {
            return null;
        }

        $schedule = $this->schedule();
        $current = collect($schedule)->firstWhere('is_now', true);

        return [
            'id' => $stream->id,
            'title' => $stream->title,
            'stream_url' => $stream->stream_url,
            'viewer_count' => $stream->viewer_count,
            'quality' => $this->site->setting('live_quality'),
            'studio' => $this->site->setting('live_studio'),
            'current_program' => $current,
            'schedule' => $schedule,
            'messages' => $this->chatHistory($stream),
        ];
    }

    /** @return array<int, array<array-key, mixed>> */
    public function schedule(): array
    {
        $now = now();

        return TvProgram::query()
            ->forDay($now)
            ->get()
            ->map(fn (TvProgram $program): array => (new TvProgramResource($program))->resolve())
            ->values()
            ->all();
    }

    /** @return array<int, array<array-key, mixed>> */
    private function chatHistory(LiveStream $stream): array
    {
        return LiveChatMessage::query()
            ->where('live_stream_id', $stream->id)
            ->where('is_hidden', false)
            ->with('user')
            ->latest('id')
            ->limit(self::CHAT_HISTORY_LIMIT)
            ->get()
            ->reverse()
            ->map(fn (LiveChatMessage $message): array => (new LiveChatMessageResource($message))->resolve())
            ->values()
            ->all();
    }
}
