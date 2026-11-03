<?php

declare(strict_types=1);

namespace App\Events;

use App\Http\Resources\LiveChatMessageResource;
use App\Models\LiveChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveChatMessageSent implements ShouldBroadcast, ShouldRescue
{
    use Dispatchable, SerializesModels;

    public function __construct(public LiveChatMessage $message) {}

    public function broadcastOn(): Channel
    {
        return new Channel("live.{$this->message->live_stream_id}");
    }

    public function broadcastAs(): string
    {
        return 'chat.sent';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return (new LiveChatMessageResource($this->message->loadMissing('user')))->resolve();
    }
}
