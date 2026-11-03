<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\SanitizeHtml;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePageRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(private SanitizeHtml $sanitizer) {}

    public function index(): Response
    {
        Gate::authorize('manage', Page::class);

        return Inertia::render('admin/pages/index', [
            'pages' => Page::query()->orderBy('title')->get()->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'url' => route('pages.show', $page->slug),
                'updated_label' => $page->updated_at?->translatedFormat('j M Y, H:i'),
            ]),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('manage', Page::class);

        return Inertia::render('admin/pages/form', ['page' => null]);
    }

    public function edit(Page $page): Response
    {
        Gate::authorize('manage', Page::class);

        return Inertia::render('admin/pages/form', [
            'page' => $page->only(['id', 'title', 'slug', 'body', 'meta_description']),
        ]);
    }

    public function store(SavePageRequest $request): RedirectResponse
    {
        Gate::authorize('manage', Page::class);

        $page = Page::query()->create($this->payload($request));

        Inertia::flash('success', 'Halaman berhasil dibuat.');

        return redirect()->route('admin.pages.edit', $page);
    }

    public function update(SavePageRequest $request, Page $page): RedirectResponse
    {
        Gate::authorize('manage', Page::class);

        $page->update($this->payload($request));

        Inertia::flash('success', 'Halaman berhasil diperbarui.');

        return back();
    }

    public function destroy(Page $page): RedirectResponse
    {
        Gate::authorize('manage', Page::class);

        $page->delete();

        Inertia::flash('success', 'Halaman berhasil dihapus.');

        return back();
    }

    /** @return array<string, mixed> */
    private function payload(SavePageRequest $request): array
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();
        $data['body'] = $this->sanitizer->handle((string) $data['body']);

        return $data;
    }
}
