<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\NewsletterIssueMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendNewsletterIssue implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $subject, public string $body) {}

    public function handle(): void
    {
        NewsletterSubscriber::query()->active()->chunkById(200, function ($subscribers): void {
            foreach ($subscribers as $subscriber) {
                Mail::to($subscriber->email)->queue(new NewsletterIssueMail($subscriber, $this->subject, $this->body));
            }
        });
    }
}
