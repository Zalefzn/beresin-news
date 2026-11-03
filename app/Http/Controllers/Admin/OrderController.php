<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

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
            'filters' => $request->only('status'),
        ]);
    }
}
