<?php

declare(strict_types=1);

use App\Events\LiveChatMessageSent;
use App\Models\LiveChatMessage;
use App\Models\LiveStream;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('guests can read but not send chat messages', function () {
    $stream = LiveStream::factory()->create();

    $this->post(route('live.chat.store', $stream), ['body' => 'Halo'])->assertRedirect(route('login'));
});

test('a signed in user can chat and the message is broadcast', function () {
    Event::fake([LiveChatMessageSent::class]);
    $stream = LiveStream::factory()->create();

    $this->actingAs(User::factory()->create())->post(route('live.chat.store', $stream), ['body' => 'Halo semua'])->assertRedirect();

    expect(LiveChatMessage::query()->firstOrFail()->body)->toBe('Halo semua');
    Event::assertDispatched(LiveChatMessageSent::class);
});

test('chat enforces length, the word filter, the rate limit and blocks', function () {
    $stream = LiveStream::factory()->create();
    $user = User::factory()->create();

    $this->actingAs(User::factory()->create())->post(route('live.chat.store', $stream), ['body' => str_repeat('a', 201)])->assertSessionHasErrors('body');

    $this->actingAs($user)->post(route('live.chat.store', $stream), ['body' => 'dasar goblok']);
    expect(LiveChatMessage::query()->firstOrFail()->body)->toBe('dasar ******');

    $this->actingAs($user)->post(route('live.chat.store', $stream), ['body' => 'terlalu cepat']);
    expect(LiveChatMessage::query()->count())->toBe(1);

    $blocked = User::factory()->create();
    $blocked->forceFill(['chat_blocked_at' => now()])->save();
    $this->actingAs($blocked)->post(route('live.chat.store', $stream), ['body' => 'Halo'])->assertForbidden();
});

test('chat is closed when the stream is offline', function () {
    $stream = LiveStream::factory()->create(['is_live' => false]);

    $this->actingAs(User::factory()->create())->post(route('live.chat.store', $stream), ['body' => 'Halo'])->assertNotFound();
});

test('the heartbeat counts distinct active sessions', function () {
    $stream = LiveStream::factory()->create();

    $this->postJson(route('live.heartbeat', $stream))->assertOk()->assertJsonPath('count', 1);
    expect($stream->fresh()->viewer_count)->toBe(1);
});
