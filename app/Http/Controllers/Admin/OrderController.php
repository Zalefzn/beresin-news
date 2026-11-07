<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\ArticlePackage;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\ArticleOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    private const int PER_PAGE = 20;

    public function index(Request $request): Response
    {
        Gate::authorize('manage', ArticleOrder::class);

        return Inertia::render('admin/orders/index', [
            'orders' => ArticleOrder::query()
                ->with(['article', 'user'])
                ->when(OrderStatus::tryFrom($request->string('status')->toString()), fn ($query, OrderStatus $status) => $query->where('status', $status))
                ->when(ArticlePackage::tryFrom($request->string('paket')->toString()), fn ($query, ArticlePackage $package) => $query->where('package', $package))
                ->when($request->filled('q'), function ($query) use ($request): void {
                    $term = '%'.$request->string('q')->toString().'%';
                    $query->where(fn ($inner) => $inner
                        ->whereLike('midtrans_order_id', $term)
                        ->orWhereHas('article', fn ($article) => $article->withTrashed()->whereLike('title', $term))
                        ->orWhereHas('user', fn ($user) => $user->whereLike('name', $term)));
                })
                ->latest('id')
                ->paginate(self::PER_PAGE)
                ->withQueryString()
                ->through(fn (ArticleOrder $order): array => [
                    'id' => $order->id,
                    'midtrans_order_id' => $order->midtrans_order_id,
                    'article_title' => $order->article->title,
                    'customer' => $order->user->name,
                    'package_label' => $order->package->label(),
                    'amount' => $order->amount,
                    'status' => $order->status->value,
                    'status_label' => $order->status->label(),
                    'payment_type' => $order->payment_type,
                    'created_label' => $order->created_at?->translatedFormat('j M Y, H:i'),
                    'paid_label' => $order->paid_at?->translatedFormat('j M Y, H:i'),
                ]),
            'statuses' => array_map(fn (OrderStatus $status): array => ['value' => $status->value, 'label' => $status->label()], OrderStatus::cases()),
            'packages' => array_map(fn (ArticlePackage $package): array => ['value' => $package->value, 'label' => $package->label()], ArticlePackage::cases()),
            'filters' => $request->only(['status', 'paket', 'q']),
        ]);
    }
}
