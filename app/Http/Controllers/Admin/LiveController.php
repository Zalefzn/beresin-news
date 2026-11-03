<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Events\LiveChatMessageHidden;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveLiveStreamRequest;
use App\Http\Requests\Admin\SaveTvProgramRequest;
use App\Http\Resources\TvProgramResource;
use App\Models\LiveChatMessage;
use App\Models\LiveStream;
use App\Models\TvProgram;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LiveController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('manage', LiveStream::class);

        $stream = LiveStream::query()->first();

        return Inertia::render('admin/live/index', [
            'stream' => $stream?->only(['id', 'title', 'stream_url', 'is_live', 'viewer_count']),
            'programs' => TvProgramResource::collection(TvProgram::query()->orderByRaw('day_of_week IS NOT NULL')->orderBy('day_of_week')->orderBy('starts_at')->get()),
            'messages' => LiveChatMessage::query()
                ->with('user')
                ->when($stream, fn ($query) => $query->where('live_stream_id', $stream?->id))
                ->where('is_hidden', false)
                ->latest('id')
                ->limit(50)
                ->get()
                ->map(fn (LiveChatMessage $message): array => [
                    'id' => $message->id,
                    'user' => $message->user->name,
                    'user_id' => $message->user_id,
                    'is_blocked' => $message->user->chat_blocked_at !== null,
                    'body' => $message->body,
                    'time' => $message->created_at?->format('H:i'),
                ]),
        ]);
    }

    public function updateStream(SaveLiveStreamRequest $request): RedirectResponse
    {
        Gate::authorize('manage', LiveStream::class);

        $stream = LiveStream::query()->first() ?? new LiveStream;
        $stream->fill($request->validated())->save();

        Inertia::flash('success', 'Pengaturan siaran diperbarui.');

        return back();
    }

    public function storeProgram(SaveTvProgramRequest $request): RedirectResponse
    {
        Gate::authorize('manage', LiveStream::class);

        TvProgram::query()->create($request->validated());

        Inertia::flash('success', 'Program ditambahkan.');

        return back();
    }

    public function updateProgram(SaveTvProgramRequest $request, TvProgram $program): RedirectResponse
    {
        Gate::authorize('manage', LiveStream::class);

        $program->update($request->validated());

        Inertia::flash('success', 'Program diperbarui.');

        return back();
    }

    public function destroyProgram(TvProgram $program): RedirectResponse
    {
        Gate::authorize('manage', LiveStream::class);

        $program->delete();

        Inertia::flash('success', 'Program dihapus.');

        return back();
    }

    public function hideMessage(LiveChatMessage $message): RedirectResponse
    {
        Gate::authorize('manage', LiveStream::class);

        $message->update(['is_hidden' => true]);
        LiveChatMessageHidden::dispatch($message->live_stream_id, $message->id);

        Inertia::flash('success', 'Pesan disembunyikan.');

        return back();
    }

    public function toggleBlock(User $user): RedirectResponse
    {
        Gate::authorize('manage', LiveStream::class);

        $isBlocked = $user->chat_blocked_at !== null;
        $user->forceFill(['chat_blocked_at' => $isBlocked ? null : now()])->save();

        Inertia::flash('success', $isBlocked ? 'Blokir obrolan dibuka.' : 'Pengguna diblokir dari obrolan.');

        return back();
    }
}
