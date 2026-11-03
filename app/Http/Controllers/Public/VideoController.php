<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCardResource;
use App\Http\Resources\VideoResource;
use App\Models\Article;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VideoController extends Controller
{
    private const int PER_PAGE = 9;

    public function index(Request $request): Response
    {
        $category = $request->string('kategori')->toString();

        $videos = Video::query()->published()->with('category')
            ->when($category !== '', fn ($query) => $query->whereHas('category', fn ($inner) => $inner->where('slug', $category)))
            ->latest('published_at')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('videos/index', [
            'videos' => VideoResource::collection($videos),
            'filters' => ['kategori' => $category],
        ]);
    }

    public function show(Request $request, string $slug): Response
    {
        $video = Video::query()->published()->with('category')->where('slug', $slug)->firstOrFail();

        $sessionKey = "video_viewed.{$video->id}";

        if (! $request->session()->has($sessionKey)) {
            $request->session()->put($sessionKey, true);
            Video::query()->whereKey($video->id)->increment('views_count');
        }

        return Inertia::render('videos/show', [
            'video' => new VideoResource($video),
            'otherVideos' => VideoResource::collection(
                Video::query()->published()->with('category')->whereKeyNot($video->id)->latest('published_at')->limit(6)->get()
            ),
            'relatedArticles' => Inertia::defer(fn () => ArticleCardResource::collection(
                Article::query()->published()->forCard()
                    ->when($video->category_id, fn ($query) => $query->where('category_id', $video->category_id))
                    ->latest('published_at')
                    ->limit(3)
                    ->get()
            )),
        ]);
    }
}
