<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\ArticleOrder;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Thin client for Midtrans Snap and its status API.
 */
class MidtransGateway
{
    private const int REQUEST_TIMEOUT_SECONDS = 15;

    public function isConfigured(): bool
    {
        return $this->serverKey() !== '';
    }

    /**
     * Creates a Snap transaction and returns the hosted payment page URL.
     */
    public function createPaymentUrl(ArticleOrder $order, string $finishUrl): string
    {
        $snapHost = $this->isProduction() ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';

        // The merchant account is shared with other Beresin sites, so the dashboard notification URL
        // belongs to them. Midtrans also notifies this URL for this transaction, without replacing theirs.
        $notificationUrl = route('midtrans.notification');
        $client = str_starts_with($notificationUrl, 'https://')
            ? $this->client()->withHeaders(['X-Append-Notification' => $notificationUrl])
            : $this->client();

        $response = $client->post("{$snapHost}/snap/v1/transactions", [
            'transaction_details' => [
                'order_id' => $order->midtrans_order_id,
                'gross_amount' => $order->amount,
            ],
            'item_details' => [[
                'id' => $order->package->value,
                'price' => $order->amount,
                'quantity' => 1,
                'name' => Str::limit('Publikasi '.$order->package->label(), 47),
            ]],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
            ],
            'callbacks' => ['finish' => $finishUrl],
        ]);

        $url = $response->json('redirect_url');

        if (! $response->successful() || ! is_string($url)) {
            throw new RuntimeException("Midtrans menolak transaksi {$order->midtrans_order_id}: HTTP {$response->status()}");
        }

        return $url;
    }

    /**
     * @return array<string, mixed>
     */
    public function fetchStatus(string $midtransOrderId): array
    {
        $apiHost = $this->isProduction() ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';

        /** @var array<string, mixed> $status */
        $status = $this->client()->get("{$apiHost}/v2/{$midtransOrderId}/status")->throw()->json();

        return $status;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function hasValidSignature(array $payload): bool
    {
        if (! $this->isConfigured() || ! is_string($payload['signature_key'] ?? null)) {
            return false;
        }

        $expected = hash('sha512', implode('', [
            $payload['order_id'] ?? '',
            $payload['status_code'] ?? '',
            $payload['gross_amount'] ?? '',
            $this->serverKey(),
        ]));

        return hash_equals($expected, $payload['signature_key']);
    }

    private function client(): PendingRequest
    {
        return Http::withBasicAuth($this->serverKey(), '')
            ->acceptJson()
            ->asJson()
            ->timeout(self::REQUEST_TIMEOUT_SECONDS);
    }

    private function serverKey(): string
    {
        return (string) config('services.midtrans.server_key');
    }

    private function isProduction(): bool
    {
        return (bool) config('services.midtrans.is_production');
    }
}
