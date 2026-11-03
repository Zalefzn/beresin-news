<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Article;
use App\Models\ArticleOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public string $url,
        public string $actionLabel,
    ) {}

    public static function paymentRequired(Article $article, string $price): self
    {
        return new self(
            'Selesaikan pembayaran',
            "Naskah \"{$article->title}\" sudah tersimpan. Bayar {$price} agar naskah masuk ke tinjauan admin.",
            route('submissions.index'),
            'Bayar Sekarang',
        );
    }

    public static function paymentReceived(Article $article): self
    {
        return new self(
            'Pembayaran diterima',
            "Pembayaran untuk \"{$article->title}\" sudah kami terima. Naskah Anda sedang menunggu tinjauan admin.",
            route('submissions.index'),
            'Lihat Status',
        );
    }

    public static function awaitingReview(Article $article): self
    {
        return new self(
            'Naskah menunggu tinjauan',
            "Naskah \"{$article->title}\" menunggu tinjauan Anda.",
            route('admin.reviews.index'),
            'Tinjau Naskah',
        );
    }

    public static function approved(Article $article): self
    {
        return new self(
            'Berita Anda telah terbit',
            "Naskah \"{$article->title}\" disetujui dan kini tayang di BeresinNews.",
            $article->url(),
            'Lihat Berita',
        );
    }

    public static function rejected(Article $article, string $reason): self
    {
        return new self(
            'Naskah perlu direvisi',
            "Naskah \"{$article->title}\" belum disetujui. Alasan: {$reason}. Anda bisa merevisi dan mengajukannya kembali tanpa biaya tambahan.",
            route('submissions.edit', $article),
            'Revisi Naskah',
        );
    }

    public static function orderRefunded(ArticleOrder $order): self
    {
        return new self(
            'Pembayaran dikembalikan',
            "Midtrans melaporkan pengembalian dana untuk pesanan {$order->midtrans_order_id}. Periksa kembali status beritanya.",
            route('admin.orders.index'),
            'Lihat Pesanan',
        );
    }

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->title} - BeresinNews")
            ->greeting('Halo!')
            ->line($this->message)
            ->action($this->actionLabel, $this->url)
            ->salutation('Salam, Redaksi BeresinNews');
    }

    /** @return array<string, string> */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }
}
