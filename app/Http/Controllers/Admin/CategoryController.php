<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('manage', Category::class);

        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()->withCount('articles')->orderBy('sort_order')->orderBy('name')->get()
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'color' => $category->color,
                    'description' => $category->description,
                    'is_active' => $category->is_active,
                    'articles_count' => $category->getAttribute('articles_count'),
                ]),
        ]);
    }

    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        Gate::authorize('manage', Category::class);

        Category::query()->create([
            ...$request->validated(),
            'sort_order' => ((int) Category::query()->max('sort_order')) + 1,
        ]);

        Inertia::flash('success', 'Kategori berhasil ditambahkan.');

        return back();
    }

    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        Gate::authorize('manage', Category::class);

        $category->update($request->validated());

        Inertia::flash('success', 'Kategori berhasil diperbarui.');

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        Gate::authorize('manage', Category::class);

        /** @var array{ids: list<int>} $data */
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:categories,id'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach ($data['ids'] as $order => $id) {
                Category::query()->whereKey($id)->first()?->update(['sort_order' => $order]);
            }
        });

        return back();
    }

    public function destroy(Category $category): RedirectResponse
    {
        Gate::authorize('manage', Category::class);

        if ($category->articles()->withTrashed()->exists()) {
            Inertia::flash('error', 'Kategori masih memiliki artikel. Nonaktifkan saja atau pindahkan artikelnya.');

            return back();
        }

        $category->delete();

        Inertia::flash('success', 'Kategori berhasil dihapus.');

        return back();
    }
}
