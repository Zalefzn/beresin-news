<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\ApplyMidtransStatus;
use App\Actions\MidtransGateway;
use App\Http\Controllers\Controller;
use App\Models\ArticleOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request, MidtransGateway $gateway, ApplyMidtransStatus $applyStatus): JsonResponse
    {
        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        abort_unless($gateway->hasValidSignature($payload), 403);

        $order = ArticleOrder::query()->where('midtrans_order_id', (string) ($payload['order_id'] ?? ''))->first();

        // Midtrans' dashboard test ping uses an unknown id and only expects a success response.
        if ($order !== null) {
            $applyStatus->handle($order, $payload);
        }

        return response()->json(['status' => 'ok']);
    }
}
