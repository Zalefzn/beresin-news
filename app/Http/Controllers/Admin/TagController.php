<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveTagRequest;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manage', Tag::class);

        return Inertia::render('admin/tags/index', [
            'tags' => Tag::query()->withCount('articles')
                ->when($request->filled('q'), fn ($query) => $query->whereLike('name', '%'.$request->string('q')->toString().'%'))
                ->orderByDesc('is_trending')
                ->orderBy('name')
                ->paginate(30)
                ->withQueryString()
                ->through(fn (Tag $tag): array => [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'is_trending' => $tag->is_trending,
                    'articles_count' => $tag->getAttribute('articles_count'),
                ]),
            'filters' => $request->only('q'),
        ]);
    }

    public function store(SaveTagRequest $request): RedirectResponse
    {
        Gate::authorize('manage', Tag::class);

        Tag::query()->create($request->validated());

        Inertia::flash('success', 'Tag berhasil ditambahkan.');

        return back();
    }

    public function update(SaveTagRequest $request, Tag $tag): RedirectResponse
    {
        Gate::authorize('manage', Tag::class);

        $tag->update($request->validated());

        Inertia::flash('success', 'Tag berhasil diperbarui.');

        return back();
    }

    public function destroy(Tag $tag): RedirectResponse
    {
        Gate::authorize('manage', Tag::class);

        $tag->delete();

        Inertia::flash('success', 'Tag berhasil dihapus.');

        return back();
    }
}
