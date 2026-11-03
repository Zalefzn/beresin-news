<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Chat word filter
    |--------------------------------------------------------------------------
    |
    | Words masked with asterisks in the live chat. Extend as moderation needs.
    |
    */

    'chat_banned_words' => ['anjing', 'bangsat', 'babi', 'kontol', 'memek', 'ngentot', 'goblok', 'tolol'],

    /*
    |--------------------------------------------------------------------------
    | Seeder image download
    |--------------------------------------------------------------------------
    */

    'seed_download_images' => (bool) env('SEED_DOWNLOAD_IMAGES', true),

];
