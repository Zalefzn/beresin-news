<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'site_name' => 'BeresinNews',
            'weather_city' => 'Jakarta',
            'weather_temp' => '29°C',
            'social' => [
                'facebook' => 'https://facebook.com/beresinnews',
                'x' => 'https://x.com/beresinnews',
                'youtube' => 'https://youtube.com/@beresinnews',
                'instagram' => 'https://instagram.com/beresinnews',
            ],
            'contact' => [
                'address' => "Gedung Menara Media Digital Lt. 12\nJl. Jend. Sudirman Kav. 52, Jakarta Selatan",
                'email' => 'officialberesin@gmail.com',
                'phone' => '085122926619',
            ],
            'footer_text' => 'Portal berita independen menyajikan analisis mendalam, informasi teknologi terdepan, serta liputan multimedia real-time terpercaya di Indonesia.',
            'analytics_code' => '',
            'live_quality' => '1080p 60FPS',
            'live_studio' => 'Beresin Studio Jakarta Central',
            'price_general' => 30000,
            'price_branding' => 50000,
        ];

        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
