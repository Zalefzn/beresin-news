<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Actions\ApplyMidtransStatus;
use App\Actions\CompleteFreeSubmission;
use App\Actions\GenerateArticleSlug;
use App\Actions\GetSharedSiteData;
use App\Actions\MidtransGateway;
use App\Actions\NotifyNewsroom;
use App\Actions\SanitizeHtml;
use App\Actions\StartArticlePayment;
use App\Enums\ArticlePackage;
use App\Enums\ArticleStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\SaveSubmissionRequest;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Throwable;

class SubmissionController extends Controller implements HasMiddleware
{
    private const int PER_PAGE = 10;

    /**
     * Paid submissions are for readers. Newsroom staff write for free in the panel,
     * and never see the package prices.
     *
     * @return list<Closure(Request, Closure): HttpResponse>
     */
    public static function middleware(): array
    {
        return [
            fn (Request $request, Closure $next): HttpResponse => $request->user()?->canAccessNewsroom()
                ? redirect()->route('admin.articles.create')
                : $next($request),
        ];
    }

    public function __construct(
        private SanitizeHtml $sanitizer,
        private GenerateArticleSlug $slugs,
        private GetSharedSiteData $site,
        private StartArticlePayment $startPayment,
        private CompleteFreeSubmission $completeFree,
    ) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $articles = Article::query()
            ->where('author_id', $user->id)
            ->whereNotNull('package')
            ->with(['category', 'orders'])
            ->latest('updated_at')
            ->paginate(self::PER_PAGE)
            ->through(fn (Article $article): array => $this->row($article));

        return Inertia::render('submissions/index', ['submissions' => $articles]);
    }

    public function create(): Response
    {
        return $this->form(null);
    }

    public function edit(Article $article): Response
    {
        Gate::authorize('updateSubmission', $article);

        return $this->form($article->load(['media', 'orders']));
    }

    public function store(SaveSubmissionRequest $request): HttpResponse
    {
        /** @var User $user */
        $user = $request->user();
        $article = new Article([
            'author_id' => $user->id,
            'status' => ArticleStatus::Draft,
        ]);
        $this->persist($article, $request);

        $price = $this->site->packagePrice($this->packageOf($article));

        if ($price > 0) {
            $user->notify(SubmissionNotification::paymentRequired($article, $this->rupiah($price)));
        }

        return $this->afterSave($article, $request, $price > 0
            ? 'Naskah tersimpan. Selesaikan pembayaran agar naskah ditinjau admin.'
            : 'Naskah tersimpan sebagai draf. Ajukan kapan saja, paket ini gratis.');
    }

    public function update(SaveSubmissionRequest $request, Article $article): HttpResponse
    {
        Gate::authorize('updateSubmission', $article);

        $this->persist($article, $request);

        return $this->afterSave($article, $request, 'Naskah berhasil diperbarui.');
    }

    public function pay(Request $request, Article $article): HttpResponse
    {
        Gate::authorize('updateSubmission', $article);

        return $this->redirectToPayment($article, $request);
    }

    /**
     * Midtrans sends the reader back here. Asking for the status keeps it correct even when
     * the webhook cannot reach this server yet, such as during local development.
     */
    public function finish(Request $request, Article $article, MidtransGateway $gateway, ApplyMidtransStatus $applyStatus): RedirectResponse
    {
        Gate::authorize('viewSubmission', $article);

        $order = $article->orders()->where('status', OrderStatus::Pending)->latest('id')->first();

        if ($order !== null && $gateway->isConfigured()) {
            try {
                $applyStatus->handle($order, $gateway->fetchStatus($order->midtrans_order_id));
            } catch (Throwable $exception) {
                Log::warning('Status pembayaran Midtrans gagal diambil.', ['order' => $order->midtrans_order_id, 'error' => $exception->getMessage()]);
            }
        }

        Inertia::flash('success', $article->hasPaidOrder()
            ? 'Pembayaran diterima. Naskah Anda menunggu tinjauan admin.'
            : 'Status pembayaran belum lunas. Halaman ini akan berubah setelah pembayaran terkonfirmasi.');

        return redirect()->route('submissions.index');
    }

    /**
     * A rejected article was already paid for, so revising it costs nothing more.
     */
    public function resubmit(Article $article, NotifyNewsroom $newsroom): RedirectResponse
    {
        Gate::authorize('updateSubmission', $article);

        if ($article->status !== ArticleStatus::Rejected || ! $article->hasPaidOrder()) {
            Inertia::flash('error', 'Naskah ini belum bisa diajukan kembali.');

            return back();
        }

        $article->update(['status' => ArticleStatus::Review, 'rejection_reason' => null]);

        $newsroom->handle(SubmissionNotification::awaitingReview($article));

        Inertia::flash('success', 'Naskah diajukan kembali dan menunggu tinjauan admin.');

        return back();
    }

    public function destroy(Article $article): RedirectResponse
    {
        Gate::authorize('updateSubmission', $article);

        if ($article->hasPaidOrder()) {
            Inertia::flash('error', 'Naskah yang sudah dibayar tidak bisa dihapus. Silakan hubungi CS.');

            return back();
        }

        $article->delete();

        Inertia::flash('success', 'Naskah dihapus.');

        return back();
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240']]);

        $path = $request->file('image')?->store('articles/inline', 'public');

        return response()->json(['url' => Storage::disk('public')->url((string) $path)]);
    }

    private function persist(Article $article, SaveSubmissionRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();
        $title = (string) $data['title'];

        $article->fill([
            'title' => $title,
            'slug' => $article->exists ? $article->slug : $this->slugs->handle($title),
            'dateline' => $data['dateline'] ?? null,
            'excerpt' => $data['excerpt'],
            'body' => $this->sanitizer->handle((string) $data['body']),
            'cover_caption' => $data['cover_caption'] ?? null,
            'cover_credit' => $data['cover_credit'] ?? null,
            'category_id' => $data['category_id'],
        ]);

        // The package is what was paid for, so it locks once paid.
        if (! $article->exists || ! $article->hasPaidOrder()) {
            $article->package = ArticlePackage::from((string) $data['package']);
        }

        $article->save();

        if ($request->hasFile('cover')) {
            $article->addMediaFromRequest('cover')->toMediaCollection('cover');
        }
    }

    private function afterSave(Article $article, SaveSubmissionRequest $request, string $message): HttpResponse
    {
        if ($request->boolean('pay_now') && ! $article->hasPaidOrder()) {
            return $this->redirectToPayment($article, $request);
        }

        Inertia::flash('success', $message);

        return redirect()->route('submissions.index');
    }

    private function redirectToPayment(Article $article, Request $request): HttpResponse
    {
        if ($article->hasPaidOrder()) {
            Inertia::flash('success', 'Naskah ini sudah lunas.');

            return redirect()->route('submissions.index');
        }

        /** @var User $user */
        $user = $request->user();

        if ($this->site->packagePrice($this->packageOf($article)) === 0) {
            $this->completeFree->handle($article, $user);
            Inertia::flash('success', 'Naskah diajukan gratis dan menunggu tinjauan admin.');

            return redirect()->route('submissions.index');
        }

        try {
            return Inertia::location($this->startPayment->handle($article, $user));
        } catch (Throwable $exception) {
            Log::error('Pembayaran Midtrans gagal dimulai.', ['article' => $article->id, 'error' => $exception->getMessage()]);
            Inertia::flash('error', 'Pembayaran belum bisa diproses. Naskah Anda aman tersimpan, silakan coba lagi nanti.');

            return redirect()->route('submissions.index');
        }
    }

    /** @return array<string, mixed> */
    private function row(Article $article): array
    {
        $isPaid = $article->hasPaidOrder();
        $package = $this->packageOf($article);

        return [
            'id' => $article->id,
            'title' => $article->title,
            'category' => $article->category->name,
            'package_label' => $package->label(),
            'status' => $article->status->value,
            'status_label' => $article->status->label(),
            'is_paid' => $isPaid,
            'is_free' => ! $isPaid && $this->site->packagePrice($package) === 0,
            'price_label' => $this->rupiah($isPaid
                ? (int) $article->orders->firstWhere('status', OrderStatus::Paid)?->amount
                : $this->site->packagePrice($package)),
            'rejection_reason' => $article->rejection_reason,
            'updated_label' => $article->updated_at?->diffForHumans(),
            'public_url' => $article->isPubliclyVisible() ? $article->url() : null,
            'preview_url' => route('articles.preview', $article->preview_token),
            'can_edit' => in_array($article->status, [ArticleStatus::Draft, ArticleStatus::Rejected], true),
            'can_delete' => ! $isPaid && $article->status === ArticleStatus::Draft,
        ];
    }

    private function form(?Article $article): Response
    {
        return Inertia::render('submissions/form', [
            'article' => $article ? [
                'id' => $article->id,
                'title' => $article->title,
                'dateline' => $article->dateline,
                'excerpt' => $article->excerpt,
                'body' => $article->body,
                'category_id' => $article->category_id,
                'package' => $article->package?->value,
                'cover_url' => $article->coverUrl('card'),
                'cover_caption' => $article->cover_caption,
                'cover_credit' => $article->cover_credit,
                'is_paid' => $article->hasPaidOrder(),
                'rejection_reason' => $article->rejection_reason,
            ] : null,
            'categories' => Category::query()->active()->get(['id', 'name']),
            'packages' => array_map(fn (ArticlePackage $package): array => [
                'value' => $package->value,
                'label' => $package->label(),
                'public_label' => $package->publicLabel(),
                'price_label' => $this->rupiah($this->site->packagePrice($package)),
                'is_free' => $this->site->packagePrice($package) === 0,
            ], ArticlePackage::cases()),
        ]);
    }

    private function packageOf(Article $article): ArticlePackage
    {
        return $article->package ?? ArticlePackage::General;
    }

    private function rupiah(int $amount): string
    {
        if ($amount === 0) {
            return 'Gratis';
        }

        return 'Rp'.number_format($amount, 0, ',', '.');
    }
}
