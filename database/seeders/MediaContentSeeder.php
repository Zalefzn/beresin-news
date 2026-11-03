<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\LiveChatMessage;
use App\Models\LiveStream;
use App\Models\TvProgram;
use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MediaContentSeeder extends Seeder
{
    private const string PLACEHOLDER_VIDEO_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    public function run(): void
    {
        $this->seedVideos();
        $this->seedLiveBroadcast();
    }

    private function seedVideos(): void
    {
        $videos = [
            ['Eksklusif: Mengintip Supercomputer AI Tercepat di Asia Tenggara', '08:45', 45000, 'photo-1558494949-ef010cbdcc31', 0, 'teknologi'],
            ['Uji Coba Mobil Listrik Otonom di Tol Layang MBZ', '05:20', 32000, 'photo-1563720223185-11003d516935', 1, 'sosial-politik'],
            ['Masa Depan Koin Digital Rupiah & Dompet Kripto Nasional', '12:10', 28000, 'photo-1621416894569-0f39ed31d247', 2, 'ekonomi'],
        ];

        foreach ($videos as [$title, $duration, $views, $photo, $daysAgo, $category]) {
            Video::query()->create([
                'title' => $title,
                'slug' => Str::slug($title),
                'source_url' => self::PLACEHOLDER_VIDEO_URL,
                'thumbnail' => "https://images.unsplash.com/{$photo}?auto=format&fit=crop&w=600&q=80",
                'duration' => $duration,
                'description' => $title.'. Liputan khusus tim video BeresinNews.',
                'category_id' => Category::query()->where('slug', $category)->value('id'),
                'views_count' => $views,
                'published_at' => now()->subDays($daysAgo)->subHour(),
            ]);
        }
    }

    private function seedLiveBroadcast(): void
    {
        $stream = LiveStream::query()->create([
            'title' => 'BeresinStream HD - Siaran Langsung 24/7',
            'stream_url' => self::PLACEHOLDER_VIDEO_URL,
            'is_live' => true,
            'viewer_count' => 0,
        ]);

        $programs = [
            ['Masa Depan AI & Dampak Transformasi Digital Indonesia', 'Diskusi panel eksklusif bersama menteri riset dan pakar teknologi terkemuka.', 'Rian Firmansyah & Anita Wijaya', '12:00', '13:30'],
            ['Beresin Siang: Rangkuman Ekonomi Global', 'Rangkuman pergerakan ekonomi global dan dampaknya bagi Indonesia.', 'Hendra Wijaya', '13:30', '15:00'],
            ['Inovasi Gadget & Startup Spotlight', 'Sorotan gadget terbaru dan startup yang sedang naik daun.', 'Dian Pratama', '15:00', '16:30'],
            ['BERESIN UTAMA: Debat Kebijakan Teknologi', 'Debat kebijakan teknologi bersama para pemangku kepentingan.', 'Rian Firmansyah & Anisa Permata', '19:00', '21:00'],
        ];

        foreach ($programs as [$title, $description, $hosts, $startsAt, $endsAt]) {
            TvProgram::query()->create([
                'title' => $title,
                'description' => $description,
                'hosts' => $hosts,
                'starts_at' => $startsAt.':00',
                'ends_at' => $endsAt.':00',
            ]);
        }

        $readers = collect(['Andi_Jkt', 'TechEnthusiast', 'Rina_M'])
            ->map(fn (string $name): User => User::factory()->create(['name' => $name]));

        $messages = ['Siarannya jernih banget!', 'IKN luar biasa perkembangannya 🚀', 'Kapan fasilitas AI ini dibuka untuk umum?'];

        foreach ($messages as $index => $body) {
            LiveChatMessage::query()->create([
                'live_stream_id' => $stream->id,
                'user_id' => $readers[$index]->id,
                'body' => $body,
            ]);
        }
    }
}
