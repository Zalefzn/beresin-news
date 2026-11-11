<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps newly registered readers on the waiting page until an admin approves their account.
 */
class EnsureAccountIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && ! $user->isApproved()) {
            abort_if($request->expectsJson(), 403, 'Akun Anda menunggu persetujuan admin.');

            return redirect()->route('account.pending');
        }

        return $next($request);
    }
}
