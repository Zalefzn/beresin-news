<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveBreakingNewsRequest;
use App\Models\Article;
use App\Models\BreakingNews;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BreakingNewsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('manage', BreakingNews::class);

        return Inertia::render('admin/breaking/index', [
            'items' => BreakingNews::query()->with('article:id,title')->orderBy('sort_order')->get()
                ->map(fn (BreakingNews $item): array => [
                    'id' => $item->id,
                    'text' => $item->text,
                    'article_id' => $item->article_id,
                    'article_title' => $item->article?->title,
                    'starts_at' => $item->starts_at?->format('Y-m-d\TH:i'),
                    'ends_at' => $item->ends_at?->format('Y-m-d\TH:i'),
                    'sort_order' => $item->sort_order,
                ]),
            'articles' => Article::query()->published()->latest('published_at')->limit(100)->get(['id', 'title']),
        ]);
    }

    public function store(SaveBreakingNewsRequest $request): RedirectResponse
    {
        Gate::authorize('manage', BreakingNews::class);

        BreakingNews::query()->create($request->validated());

        Inertia::flash('success', 'Breaking news berhasil ditambahkan.');

        return back();
    }

    public function update(SaveBreakingNewsRequest $request, BreakingNews $breakingNews): RedirectResponse
    {
        Gate::authorize('manage', BreakingNews::class);

        $breakingNews->update($request->validated());

        Inertia::flash('success', 'Breaking news berhasil diperbarui.');

        return back();
    }

    public function destroy(BreakingNews $breakingNews): RedirectResponse
    {
        Gate::authorize('manage', BreakingNews::class);

        $breakingNews->delete();

        Inertia::flash('success', 'Breaking news berhasil dihapus.');

        return back();
    }
}
