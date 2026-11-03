<?php

declare(strict_types=1);

namespace App\Actions;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * Sanitizes rich text from the editor. Only YouTube iframes survive.
 */
class SanitizeHtml
{
    private const int MAX_INPUT_LENGTH = 1_000_000;

    /** @var list<string> */
    private const array ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'];

    public function handle(string $html): string
    {
        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowLinkSchemes(['https', 'http', 'mailto'])
            ->allowMediaSchemes(['https', 'http'])
            ->allowRelativeLinks()
            ->allowRelativeMedias()
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->allowElement('iframe', ['src', 'width', 'height', 'allowfullscreen', 'title'])
            ->allowAttribute('data-youtube-video', 'div')
            ->withMaxInputLength(self::MAX_INPUT_LENGTH);

        $sanitized = (new HtmlSanitizer($config))->sanitize($html);

        return (string) preg_replace_callback(
            '#<iframe\b[^>]*>.*?</iframe>#is',
            fn (array $match): string => $this->isAllowedIframe($match[0]) ? $match[0] : '',
            $sanitized,
        );
    }

    private function isAllowedIframe(string $iframe): bool
    {
        if (preg_match('/\ssrc="([^"]+)"/i', $iframe, $src) !== 1) {
            return false;
        }

        $parts = parse_url(html_entity_decode($src[1]));

        return ($parts['scheme'] ?? '') === 'https'
            && in_array($parts['host'] ?? '', self::ALLOWED_IFRAME_HOSTS, true);
    }
}
