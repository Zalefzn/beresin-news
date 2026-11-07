<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sends www.<domain> to the canonical host from APP_URL so search engines index one copy of the site.
 */
class RedirectToCanonicalHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $canonicalUrl = rtrim((string) config('app.url'), '/');
        $canonicalHost = parse_url($canonicalUrl, PHP_URL_HOST);

        if (is_string($canonicalHost) && $request->getHost() === 'www.'.$canonicalHost) {
            return redirect()->to($canonicalUrl.$request->getRequestUri(), 301);
        }

        return $next($request);
    }
}
