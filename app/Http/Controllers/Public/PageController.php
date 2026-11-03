<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = Page::query()->where('slug', $slug)->firstOrFail();

        return Inertia::render('pages/show', [
            'page' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'body' => $page->body,
                'meta_description' => $page->meta_description,
                'updated_label' => $page->updated_at?->translatedFormat('j F Y'),
            ],
        ]);
    }
}
