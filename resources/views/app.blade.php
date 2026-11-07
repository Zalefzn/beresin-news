<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['scroll-smooth', 'dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #F8FAFC;
            }

            html.dark {
                background-color: #020617;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="alternate" type="application/rss+xml" title="BeresinNews" href="{{ route('feeds.rss') }}">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'BeresinNews') }}</title>
        </x-inertia::head>

        @php($googleVerification = app(\App\Actions\GetSharedSiteData::class)->setting('google_site_verification'))
        @if ($googleVerification)
            <meta name="google-site-verification" content="{{ $googleVerification }}">
        @endif

        @php($analyticsCode = app(\App\Actions\GetSharedSiteData::class)->setting('analytics_code'))
        @if ($analyticsCode)
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $analyticsCode }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', @json($analyticsCode));
            </script>
        @endif
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
