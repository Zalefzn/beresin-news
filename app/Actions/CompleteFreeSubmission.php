<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ArticleStatus;
use App\Enums\OrderStatus;
use App\Models\Article;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * When the admin sets a package price to zero, the submission skips Midtrans and goes straight to review.
 * A zero-amount paid order is recorded so the package locks and resubmitting stays free, like a paid one.
 */
class CompleteFreeSubmission
{
    public function __construct(private NotifyNewsroom $newsroom) {}

    public function handle(Article $article, User $user): void
    {
        DB::transaction(function () use ($article, $user): void {
            $article->orders()->create([
                'user_id' => $user->id,
                'package' => $article->package,
                'amount' => 0,
                'status' => OrderStatus::Paid,
                'payment_type' => 'gratis',
                'paid_at' => now(),
                'midtrans_order_id' => 'FREE-'.$article->id.'-'.Str::upper(Str::random(10)),
            ]);

            if ($article->status === ArticleStatus::Draft) {
                $article->update(['status' => ArticleStatus::Review, 'rejection_reason' => null]);
            }
        });

        $article->unsetRelation('orders');

        $this->newsroom->handle(SubmissionNotification::awaitingReview($article));
    }
}
