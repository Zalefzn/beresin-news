<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    private const string DRAFT_NOTE = '<p><em>Konten contoh. Redaksi perlu meninjau dan melengkapi halaman ini sebelum situs ditayangkan.</em></p>';

    public function run(): void
    {
        $pages = [
            ['Tentang Kami', 'tentang-kami', '<p>BeresinNews adalah portal berita digital yang menyajikan analisis mendalam, informasi teknologi terdepan, serta liputan multimedia real-time di Indonesia.</p>'],
            ['Susunan Redaksi', 'redaksi', '<p>Susunan redaksi BeresinNews akan dicantumkan di halaman ini.</p>'],
            ['Pedoman Media Siber', 'pedoman-media-siber', '<p>BeresinNews berkomitmen menjalankan Pedoman Pemberitaan Media Siber yang ditetapkan Dewan Pers. Naskah lengkap pedoman akan dicantumkan di halaman ini.</p>'],
            ['Ketentuan Layanan', 'ketentuan-layanan', '<p>Ketentuan penggunaan layanan BeresinNews akan dicantumkan di halaman ini.</p>'],
            ['Kebijakan Privasi', 'kebijakan-privasi', '<p>Kebijakan pengelolaan data pribadi pembaca BeresinNews akan dicantumkan di halaman ini.</p>'],
            ['Karir', 'karir', '<p>Informasi lowongan kerja di BeresinNews akan dicantumkan di halaman ini.</p>'],
            ['Iklan & Kemitraan', 'iklan-kemitraan', '<p>Informasi peluang iklan dan kemitraan dengan BeresinNews akan dicantumkan di halaman ini.</p>'],
        ];

        foreach ($pages as [$title, $slug, $body]) {
            Page::query()->create([
                'title' => $title,
                'slug' => $slug,
                'body' => $body.self::DRAFT_NOTE,
                'meta_description' => "{$title} BeresinNews.",
            ]);
        }
    }
}
