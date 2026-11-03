<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;

class LiveChatMessageHidden implements ShouldBroadcast, ShouldRescue
{
    use Dispatchable;

    public function __construct(public int $streamId, public int $messageId) {}

    public function broadcastOn(): Channel
    {
        return new Channel("live.{$this->streamId}");
    }

    public function broadcastAs(): string
    {
        return 'chat.hidden';
    }

    /** @return array{id: int} */
    public function broadcastWith(): array
    {
        return ['id' => $this->messageId];
    }
}
