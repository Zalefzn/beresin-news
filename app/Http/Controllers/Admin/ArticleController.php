<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\GenerateArticleSlug;
use App\Actions\SanitizeHtml;
use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AutosaveArticleRequest;
use App\Http\Requests\Admin\SaveArticleRequest;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    private const int PER_PAGE = 15;

    public function __construct(private SanitizeHtml $sanitizer) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Article::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->only(['status', 'kategori', 'penulis', 'q']);

        $articles = Article::query()
            ->with(['category', 'author'])
            ->when(! $user->canManageNewsroom(), fn ($query) => $query->where('author_id', $user->id))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('kategori'), fn ($query) => $query->where('category_id', $request->integer('kategori')))
            ->when($request->filled('penulis'), fn ($query) => $query->where('author_id', $request->integer('penulis')))
            ->when($request->filled('q'), fn ($query) => $query->whereLike('title', '%'.$request->string('q')->toString().'%'))
            ->latest('updated_at')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Article $article): array => [
                'id' => $article->id,
                'title' => $article->title,
                'category' => $article->category->name,
                'author' => $article->author->name,
                'status' => $article->status->value,
                'status_label' => $article->status->label(),
                'package_label' => $article->package?->label(),
                'published_label' => $article->published_at?->translatedFormat('j M Y, H:i'),
                'views_count' => $article->views_count,
                'preview_url' => route('articles.preview', $article->preview_token),
                'can_update' => $user->can('update', $article),
                'can_delete' => $user->can('delete', $article),
            ]);

        return Inertia::render('admin/articles/index', [
            'articles' => $articles,
            'filters' => $filters,
            'statuses' => $this->statusOptions(),
            'categories' => $this->categoryOptions(),
            'authors' => $user->canManageNewsroom()
                ? User::query()->where('role', '!=', 'reader')->orderBy('name')->get(['id', 'name'])
                : [],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Article::class);

        return $this->form(null, $request);
    }

    public function edit(Request $request, Article $article): Response
    {
        Gate::authorize('update', $article);

        return $this->form($article->load(['tags', 'media']), $request);
    }

    public function store(SaveArticleRequest $request): RedirectResponse
    {
        Gate::authorize('create', Article::class);

        /** @var User $user */
        $user = $request->user();
        $article = new Article(['author_id' => $user->id]);
        $this->persist($article, $request);

        Inertia::flash('success', 'Artikel berhasil disimpan.');

        return redirect()->route('admin.articles.edit', $article);
    }

    public function update(SaveArticleRequest $request, Article $article): RedirectResponse
    {
        Gate::authorize('update', $article);

        $this->persist($article, $request);

        Inertia::flash('success', 'Artikel berhasil diperbarui.');

        return back();
    }

    /**
     * Saves the text of a draft or review article without touching its status.
     */
    public function autosave(AutosaveArticleRequest $request, Article $article): JsonResponse
    {
        Gate::authorize('update', $article);

        abort_if(in_array($article->status, [ArticleStatus::Published, ArticleStatus::Scheduled], true), 409);

        /** @var array{title: string, excerpt?: string|null, body?: string|null, dateline?: string|null} $data */
        $data = $request->validated();

        $article->update([
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'dateline' => $data['dateline'] ?? null,
            'body' => $this->sanitizer->handle($data['body'] ?? ''),
        ]);

        return response()->json(['saved_at' => now()->format('H:i')]);
    }

    public function destroy(Article $article): RedirectResponse
    {
        Gate::authorize('delete', $article);

        $article->delete();

        Inertia::flash('success', 'Artikel dipindahkan ke tempat sampah.');

        return back();
    }

    public function uploadImage(Request $request): JsonResponse
    {
        Gate::authorize('create', Article::class);

        $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);

        $path = $request->file('image')?->store('articles/inline', 'public');

        return response()->json(['url' => Storage::disk('public')->url((string) $path)]);
    }

    private function persist(Article $article, SaveArticleRequest $request): void
    {
        /** @var User $user */
        $user = $request->user();
        /** @var array<string, mixed> $data */
        $data = $request->validated();
        $status = ArticleStatus::from((string) $data['status']);

        $article->fill([
            'title' => $data['title'],
            'slug' => $data['slug'] ?: (new GenerateArticleSlug)->handle((string) $data['title'], $article->id),
            'dateline' => $data['dateline'] ?? null,
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $this->sanitizer->handle((string) $data['body']),
            'cover_caption' => $data['cover_caption'] ?? null,
            'cover_credit' => $data['cover_credit'] ?? null,
            'category_id' => $data['category_id'],
            'status' => $status,
            'published_at' => $this->resolvePublishedAt($status, $data['published_at'] ?? null, $article),
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
        ]);

        if ($user->isAdmin()) {
            $article->fill([
                'is_headline' => (bool) ($data['is_headline'] ?? false),
                'is_trending' => (bool) ($data['is_trending'] ?? false),
                'is_breaking' => (bool) ($data['is_breaking'] ?? false),
                'editor_id' => $status->requiresPublishPermission() ? $user->id : $article->editor_id,
            ]);
        }

        $article->save();

        /** @var list<string> $tagNames */
        $tagNames = $data['tags'] ?? [];
        $article->tags()->sync($this->resolveTagIds($tagNames));

        if ($request->hasFile('cover')) {
            $article->addMediaFromRequest('cover')->toMediaCollection('cover');
        }
    }

    private function resolvePublishedAt(ArticleStatus $status, mixed $requested, Article $article): mixed
    {
        return match ($status) {
            ArticleStatus::Published => $requested ?: ($article->published_at ?? now()),
            ArticleStatus::Scheduled => $requested,
            default => $article->published_at,
        };
    }

    /**
     * @param  list<string>  $names
     * @return array<int, int>
     */
    private function resolveTagIds(array $names): array
    {
        return collect($names)
            ->map(fn (string $name): string => trim(ltrim(trim($name), '#')))
            ->filter()
            ->unique(fn (string $name): string => Str::slug($name))
            ->filter(fn (string $name): bool => Str::slug($name) !== '')
            ->map(fn (string $name): int => Tag::query()->firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id)
            ->values()
            ->all();
    }

    private function form(?Article $article, Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('admin/articles/form', [
            'article' => $article ? [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'dateline' => $article->dateline,
                'excerpt' => $article->excerpt,
                'body' => $article->body,
                'cover_url' => $article->coverUrl('card'),
                'cover_caption' => $article->cover_caption,
                'cover_credit' => $article->cover_credit,
                'category_id' => $article->category_id,
                'tags' => $article->tags->pluck('name')->all(),
                'is_headline' => $article->is_headline,
                'is_trending' => $article->is_trending,
                'is_breaking' => $article->is_breaking,
                'status' => $article->status->value,
                'published_at' => $article->published_at?->format('Y-m-d\TH:i'),
                'meta_title' => $article->meta_title,
                'meta_description' => $article->meta_description,
                'preview_url' => route('articles.preview', $article->preview_token),
            ] : null,
            'categories' => $this->categoryOptions(),
            'statuses' => collect($this->statusOptions())
                ->filter(fn (array $option): bool => $user->isAdmin() || ! ArticleStatus::from($option['value'])->requiresPublishPermission())
                ->values(),
            'canPublish' => $user->isAdmin(),
        ]);
    }

    /** @return list<array{value: string, label: string}> */
    private function statusOptions(): array
    {
        return array_map(
            fn (ArticleStatus $status): array => ['value' => $status->value, 'label' => $status->label()],
            ArticleStatus::cases(),
        );
    }

    /** @return Collection<int, Category> */
    private function categoryOptions(): Collection
    {
        return Category::query()->orderBy('sort_order')->get(['id', 'name'])->toBase();
    }
}
