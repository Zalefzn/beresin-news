<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterIssueMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public NewsletterSubscriber $subscriber,
        public string $issueSubject,
        public string $issueBody,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->issueSubject);
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.newsletter-issue', with: [
            'body' => $this->issueBody,
            'unsubscribeUrl' => route('newsletter.unsubscribe', $this->subscriber->token),
        ]);
    }
}
