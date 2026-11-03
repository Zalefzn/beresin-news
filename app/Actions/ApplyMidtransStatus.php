<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ArticleStatus;
use App\Enums\OrderStatus;
use App\Models\ArticleOrder;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Moves an order to the state Midtrans reports. Safe to call repeatedly for the same status.
 */
class ApplyMidtransStatus
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function handle(ArticleOrder $order, array $payload): void
    {
        if ((int) ($payload['gross_amount'] ?? 0) !== $order->amount) {
            Log::warning('Nominal Midtrans tidak cocok dengan pesanan.', ['order' => $order->midtrans_order_id]);

            return;
        }

        $newStatus = $this->mapStatus($payload);

        if ($newStatus === null) {
            return;
        }

        $becamePaid = DB::transaction(function () use ($order, $newStatus, $payload): bool {
            /** @var ArticleOrder $locked */
            $locked = ArticleOrder::query()->lockForUpdate()->findOrFail($order->id);

            // A late "expire" notification must never undo a completed payment.
            if ($locked->status === OrderStatus::Paid && $newStatus !== OrderStatus::Refunded) {
                return false;
            }

            if ($locked->status === $newStatus) {
                return false;
            }

            $locked->update([
                'status' => $newStatus,
                'payment_type' => is_string($payload['payment_type'] ?? null) ? $payload['payment_type'] : $locked->payment_type,
                'paid_at' => $newStatus === OrderStatus::Paid ? now() : $locked->paid_at,
            ]);

            if ($newStatus !== OrderStatus::Paid) {
                return false;
            }

            $article = $locked->article;

            if ($article->status === ArticleStatus::Draft) {
                $article->update(['status' => ArticleStatus::Review, 'rejection_reason' => null]);
            }

            return true;
        });

        $order->refresh();

        if ($becamePaid) {
            $this->notifyPaid($order);
        }

        if ($newStatus === OrderStatus::Refunded) {
            $this->notifyAdmins($order, SubmissionNotification::orderRefunded($order));
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function mapStatus(array $payload): ?OrderStatus
    {
        return match ($payload['transaction_status'] ?? null) {
            'settlement' => OrderStatus::Paid,
            'capture' => ($payload['fraud_status'] ?? 'accept') === 'accept' ? OrderStatus::Paid : null,
            'deny', 'cancel', 'expire', 'failure' => OrderStatus::Failed,
            'refund', 'partial_refund', 'chargeback', 'partial_chargeback' => OrderStatus::Refunded,
            default => null,
        };
    }

    private function notifyPaid(ArticleOrder $order): void
    {
        $order->user->notify(SubmissionNotification::paymentReceived($order->article));
        $this->notifyAdmins($order, SubmissionNotification::awaitingReview($order->article));
    }

    private function notifyAdmins(ArticleOrder $order, SubmissionNotification $notification): void
    {
        Notification::send(User::query()->where('role', 'admin')->where('is_active', true)->get(), $notification);
    }
}
