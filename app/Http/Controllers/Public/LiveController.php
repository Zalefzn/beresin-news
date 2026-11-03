<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetLiveBroadcast;
use App\Actions\RecordArticleView;
use App\Actions\RecordLiveViewer;
use App\Http\Controllers\Controller;
use App\Models\LiveStream;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LiveController extends Controller
{
    public function index(GetLiveBroadcast $broadcast): Response
    {
        return Inertia::render('live/index', [
            'liveStream' => $broadcast->handle(),
            'schedule' => $broadcast->schedule(),
        ]);
    }

    public function heartbeat(Request $request, LiveStream $stream, RecordLiveViewer $viewers, RecordArticleView $views): JsonResponse
    {
        abort_unless($stream->is_live, 404);

        return response()->json(['count' => $viewers->handle($stream, $views->sessionHash($request))]);
    }
}
