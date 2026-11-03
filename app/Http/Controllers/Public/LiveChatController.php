<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\FilterChatMessage;
use App\Events\LiveChatMessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreLiveChatMessageRequest;
use App\Models\LiveStream;
use Illuminate\Http\RedirectResponse;

class LiveChatController extends Controller
{
    public function store(StoreLiveChatMessageRequest $request, LiveStream $stream, FilterChatMessage $filter): RedirectResponse
    {
        abort_unless($stream->is_live, 404);

        $message = $stream->messages()->create([
            'user_id' => $request->user()?->id,
            'body' => $filter->handle($request->string('body')->toString()),
        ]);

        LiveChatMessageSent::dispatch($message);

        return back();
    }
}
