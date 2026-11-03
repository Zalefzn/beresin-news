<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;

class LiveViewerCountUpdated implements ShouldBroadcast, ShouldRescue
{
    use Dispatchable;

    public function __construct(public int $streamId, public int $count) {}

    public function broadcastOn(): Channel
    {
        return new Channel("live.{$this->streamId}");
    }

    public function broadcastAs(): string
    {
        return 'viewers.updated';
    }

    /** @return array{count: int} */
    public function broadcastWith(): array
    {
        return ['count' => $this->count];
    }
}
