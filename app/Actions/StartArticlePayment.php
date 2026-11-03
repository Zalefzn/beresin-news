<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ArticlePackage;
use App\Enums\OrderStatus;
use App\Models\Article;
use App\Models\User;
use Illuminate\Support\Str;

class StartArticlePayment
{
    private const int REUSABLE_PAYMENT_HOURS = 23;

    public function __construct(private MidtransGateway $gateway, private GetSharedSiteData $site) {}

    /**
     * Returns the Midtrans payment page for the article, reusing a recent unpaid order at the current price.
     */
    public function handle(Article $article, User $user): string
    {
        /** @var ArticlePackage $package */
        $package = $article->package;
        $amount = $this->site->packagePrice($package);

        $existing = $article->orders()
            ->where('status', OrderStatus::Pending)
            ->where('package', $package)
            ->where('amount', $amount)
            ->where('created_at', '>=', now()->subHours(self::REUSABLE_PAYMENT_HOURS))
            ->whereNotNull('payment_url')
            ->latest('id')
            ->first();

        if ($existing?->payment_url !== null) {
            return $existing->payment_url;
        }

        $order = $article->orders()->create([
            'user_id' => $user->id,
            'package' => $package,
            'amount' => $amount,
            'status' => OrderStatus::Pending,
            'midtrans_order_id' => 'BRN-'.$article->id.'-'.Str::upper(Str::random(10)),
        ]);

        $url = $this->gateway->createPaymentUrl($order, route('submissions.finish', $article));
        $order->update(['payment_url' => $url]);

        return $url;
    }
}
