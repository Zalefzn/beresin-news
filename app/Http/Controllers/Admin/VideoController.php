<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveVideoRequest;
use App\Models\Category;
use App\Models\Video;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VideoController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('manage', Video::class);

        return Inertia::render('admin/videos/index', [
            'videos' => Video::query()->with('category')->latest('id')->paginate(15)->through(fn (Video $video): array => [
                'id' => $video->id,
                'title' => $video->title,
                'slug' => $video->slug,
                'source_url' => $video->source_url,
                'thumbnail' => $video->thumbnail,
                'duration' => $video->duration,
                'description' => $video->description,
                'category_id' => $video->category_id,
                'category' => $video->category?->name,
                'views_count' => $video->views_count,
                'published_at' => $video->published_at?->format('Y-m-d\TH:i'),
            ]),
            'categories' => Category::query()->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function store(SaveVideoRequest $request): RedirectResponse
    {
        Gate::authorize('manage', Video::class);

        Video::query()->create($request->validated());

        Inertia::flash('success', 'Video berhasil ditambahkan.');

        return back();
    }

    public function update(SaveVideoRequest $request, Video $video): RedirectResponse
    {
        Gate::authorize('manage', Video::class);

        $video->update($request->validated());

        Inertia::flash('success', 'Video berhasil diperbarui.');

        return back();
    }

    public function destroy(Video $video): RedirectResponse
    {
        Gate::authorize('manage', Video::class);

        $video->delete();

        Inertia::flash('success', 'Video berhasil dihapus.');

        return back();
    }
}
