<?php

declare(strict_types=1);

namespace App\Actions;

class FilterChatMessage
{
    public function handle(string $body): string
    {
        /** @var list<string> $bannedWords */
        $bannedWords = config('beresin.chat_banned_words', []);
        $clean = trim(strip_tags($body));

        foreach ($bannedWords as $word) {
            $clean = (string) preg_replace_callback(
                '/\b'.preg_quote($word, '/').'\b/iu',
                fn (array $match): string => str_repeat('*', mb_strlen($match[0])),
                $clean,
            );
        }

        return $clean;
    }
}
