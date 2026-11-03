<?php

declare(strict_types=1);

use App\Actions\SanitizeHtml;

test('safe formatting survives', function () {
    $html = '<h2>Judul</h2><p><strong>Tebal</strong> <em>miring</em></p><ul><li>Satu</li></ul><blockquote>Kutip</blockquote>';

    expect((new SanitizeHtml)->handle($html))->toBe($html);
});

test('dangerous markup is removed', function (string $html, string $forbidden) {
    expect((new SanitizeHtml)->handle($html))->not->toContain($forbidden);
})->with([
    'script' => ['<script>alert(1)</script>', 'alert'],
    'event handler' => ['<p onclick="alert(1)">x</p>', 'onclick'],
    'javascript link' => ['<a href="javascript:alert(1)">x</a>', 'javascript'],
    'foreign iframe' => ['<iframe src="https://evil.example/x"></iframe>', 'evil.example'],
    'http youtube iframe' => ['<iframe src="http://www.youtube.com/embed/abc"></iframe>', 'iframe'],
]);

test('youtube embeds are kept', function () {
    $html = '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/abc" width="640" height="360"></iframe></div>';

    expect((new SanitizeHtml)->handle($html))->toContain('youtube-nocookie.com/embed/abc');
});

test('articles longer than the default sanitizer limit are not truncated', function () {
    $html = '<p>'.str_repeat('a', 50000).'</p>';

    expect(strlen((new SanitizeHtml)->handle($html)))->toBeGreaterThan(50000);
});
