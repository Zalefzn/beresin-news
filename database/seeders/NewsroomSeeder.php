<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ArticleStatus;
use App\Enums\CommentStatus;
use App\Enums\UserRole;
use App\Models\Article;
use App\Models\ArticleView;
use App\Models\BreakingNews;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class NewsroomSeeder extends Seeder
{
    private const string UNSPLASH = 'https://images.unsplash.com/';

    /**
     * Name, slug, color and description, in navigation order.
     *
     * @var list<array{string, string, string, string}>
     */
    public const array CATEGORIES = [
        ['Teknologi', 'teknologi', 'bg-blue-600', 'Perkembangan teknologi digital, internet, dan inovasi.'],
        ['Edukasi & Pendidikan', 'edukasi-pendidikan', 'bg-purple-600', 'Edukasi dan perkembangan dunia pendidikan.'],
        ['Ekonomi', 'ekonomi', 'bg-emerald-600', 'Ekonomi, pasar, dan bisnis.'],
        ['Sosial & Politik', 'sosial-politik', 'bg-rose-600', 'Isu sosial, kebijakan publik, dan politik.'],
    ];

    private const string UNSPLASH_PARAMS = '?auto=format&fit=crop&w=1200&q=80';

    public function run(): void
    {
        config(['media-library.queue_conversions_by_default' => false]);

        $categories = $this->seedCategories();
        $authors = $this->seedAuthors();
        $tags = $this->seedTags();

        foreach ($this->articles() as $index => $data) {
            $article = Article::query()->create([
                'title' => $data['title'],
                'slug' => $data['slug'],
                'dateline' => $data['dateline'],
                'excerpt' => $data['excerpt'],
                'body' => collect($data['paragraphs'])->map(fn (string $paragraph): string => "<p>{$paragraph}</p>")->implode(''),
                'cover_caption' => 'Foto ilustrasi: '.$data['title'],
                'cover_credit' => 'Unsplash',
                'category_id' => $categories[$data['category']]->id,
                'author_id' => $authors[$data['author']]->id,
                'status' => ArticleStatus::Published,
                'published_at' => now()->subMinutes($data['minutes_ago']),
                'is_headline' => $data['headline'] ?? false,
                'is_trending' => $data['trending'],
                'views_count' => $data['views'],
                'likes_count' => $data['likes'],
            ]);

            $article->tags()->sync(collect($data['tags'])->map(fn (string $name): int => $tags[$name]->id));
            $this->attachCover($article, $data['image']);
            $this->seedRecentViews($article, (int) ($data['views'] / 400), $index);
        }

        $this->seedComments();
        $this->seedBreakingNews();
    }

    /** @return array<string, Category> */
    private function seedCategories(): array
    {
        $categories = [];

        foreach (self::CATEGORIES as $order => [$name, $slug, $color, $description]) {
            $categories[$slug] = Category::query()->firstOrCreate(['slug' => $slug], [
                'name' => $name, 'color' => $color, 'description' => $description, 'sort_order' => $order,
            ]);
        }

        return $categories;
    }

    /**
     * A sample account without factories (Faker is not installed in production). The password is
     * random and never shown, so nobody can sign in with it until an admin resets it.
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function sampleUser(array $attributes): User
    {
        $user = new User([
            'slug' => Str::slug((string) $attributes['name']).'-'.Str::lower(Str::random(4)),
            'email' => Str::slug((string) $attributes['name']).'.'.Str::lower(Str::random(6)).'@contoh.beresinnews.com',
            ...$attributes,
            'password' => Str::password(32),
        ]);
        $user->forceFill(['email_verified_at' => now(), 'approved_at' => now()])->save();

        return $user;
    }

    /** @return array<string, User> */
    private function seedAuthors(): array
    {
        $rows = [
            ['Rian Firmansyah', 'Redaktur Senior Teknologi', UserRole::Editor, 'photo-1534528741775-53994a69daeb'],
            ['Anisa Permata', 'Analis Telekomunikasi', UserRole::Writer, 'photo-1517841905240-472988babdf9'],
            ['Hendra Wijaya', 'Jurnalis Ekonomi', UserRole::Writer, 'photo-1507003211169-0a1dd7228f2d'],
            ['Dian Pratama', 'Reviewer Inovasi', UserRole::Writer, 'photo-1500648767791-00dcc994a43e'],
        ];

        $authors = [];

        foreach ($rows as [$name, $jobTitle, $role, $photo]) {
            $slug = Str::slug($name);
            $author = self::sampleUser([
                'name' => $name,
                'slug' => $slug,
                'email' => "{$slug}@beresinnews.id",
                'job_title' => $jobTitle,
                'bio' => "{$name} adalah {$jobTitle} di BeresinNews.",
                'avatar' => self::UNSPLASH.$photo.'?auto=format&fit=crop&w=150&q=80',
            ]);
            $author->forceFill(['role' => $role])->save();
            $authors[$name] = $author;
        }

        return $authors;
    }

    /** @return array<string, Tag> */
    private function seedTags(): array
    {
        $tags = [];

        foreach (['AIPerkembangan' => true, 'Starlink3' => true, 'IUKN2026' => true, 'Ekonomi2026' => false, 'Semikonduktor' => false, 'MobilOtonom' => false, 'Smartphone' => false] as $name => $isTrending) {
            $tags[$name] = Tag::query()->create(['name' => $name, 'slug' => Str::slug($name), 'is_trending' => $isTrending]);
        }

        return $tags;
    }

    private function attachCover(Article $article, string $photo): void
    {
        if (! config('beresin.seed_download_images') || app()->runningUnitTests()) {
            return;
        }

        try {
            $article->addMediaFromUrl(self::UNSPLASH.$photo.self::UNSPLASH_PARAMS)
                ->usingFileName($article->slug.'.jpg')
                ->toMediaCollection('cover');
        } catch (Throwable $exception) {
            Log::warning('Gambar contoh gagal diunduh, artikel memakai placeholder.', [
                'article' => $article->slug,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function seedRecentViews(Article $article, int $count, int $offset): void
    {
        ArticleView::query()->insert(collect(range(1, max(1, $count)))->map(fn (int $number): array => [
            'article_id' => $article->id,
            'session_hash' => hash('sha256', "seed-{$article->id}-{$number}"),
            'viewed_at' => now()->subMinutes(($number + $offset) % 1400),
        ])->all());
    }

    private function seedComments(): void
    {
        $article = Article::query()->where('slug', 'pemerintah-resmikan-pusat-riset-ai-nasional-ikn')->firstOrFail();

        $article->comments()->createMany([
            ['name' => 'Budi Santoso', 'body' => 'Langkah luar biasa untuk kedaulatan digital Indonesia!', 'status' => CommentStatus::Approved, 'created_at' => now()->subMinutes(10)],
            ['name' => 'Siti Rahma', 'body' => 'Semoga risetnya benar-benar dirasakan manfaatnya oleh petani lokal.', 'status' => CommentStatus::Approved, 'created_at' => now()->subMinutes(25)],
        ]);

        $article->update(['comments_count' => 2]);
    }

    private function seedBreakingNews(): void
    {
        $items = [
            ['Pemerintah resmikan Pusat AI Nasional di IKN Nusantara senilai Rp 12 Triliun.', 'pemerintah-resmikan-pusat-riset-ai-nasional-ikn'],
            ['Rupiah menguat ke posisi Rp 15.100 per Dolar AS terdorong lonjakan investasi baterai EV.', 'rupiah-menguat-ekspor-ev-battery'],
            ['Starlink Generasi 3 berkecepatan 1 Gbps resmi diluncurkan untuk kawasan pedalaman Indonesia.', 'starlink-gen-3-meluncur-indonesia'],
            ['Uji coba armada bus otonom pintar di Koridor Sudirman-Thamrin berjalan lancar.', 'mobil-otonom-uji-coba-jakarta'],
        ];

        foreach ($items as $order => [$text, $slug]) {
            BreakingNews::query()->create([
                'text' => $text,
                'article_id' => Article::query()->where('slug', $slug)->value('id'),
                'sort_order' => $order,
            ]);
        }
    }

    /** @return list<array{title: string, slug: string, category: string, author: string, dateline: string, image: string, excerpt: string, paragraphs: list<string>, headline?: bool, trending: bool, views: int, likes: int, minutes_ago: int, tags: list<string>}> */
    private function articles(): array
    {
        return [
            [
                'title' => 'Pemerintah Resmikan Pusat Riset AI Nasional Terbesar di IKN Nusantara',
                'slug' => 'pemerintah-resmikan-pusat-riset-ai-nasional-ikn',
                'category' => 'teknologi',
                'author' => 'Rian Firmansyah',
                'dateline' => 'Penajam Paser Utara',
                'image' => 'photo-1618005182384-a83a8bd57fbe',
                'excerpt' => 'Fasilitas superkomputer senilai Rp 12 Triliun siap mempercepat inovasi kecerdasan buatan terapan di bidang medis, pertanian modern, dan keamanan cyber.',
                'paragraphs' => [
                    'Presiden meresmikan Pusat Komputasi AI dan Inovasi Masa Depan Nusantara (Nusantara AI Hub) pada Jumat pagi. Fasilitas yang berlokasi di Kawasan Inti Pusat Pemerintahan (KIPP) IKN ini dilengkapi ribuan pemroses grafis tingkat lanjut untuk mengakselerasi kemandirian teknologi nasional.',
                    'Dalam pidato peresmiannya, ditegaskan bahwa kemajuan teknologi tidak boleh hanya menjadikan Indonesia sebagai konsumen semata, melainkan produsen solusi inovatif skala global.',
                    'Pusat riset ini bermitra dengan belasan universitas terkemuka dan perusahaan teknologi global. Fokus utama pengembangan awal meliputi pengolahan bahasa alami (NLP) bahasa daerah Indonesia, otomatisasi sistem pertanian cerdas, serta prediksi cuaca mikro presisi tinggi.',
                ],
                'headline' => true,
                'trending' => true,
                'views' => 24890,
                'likes' => 340,
                'minutes_ago' => 5,
                'tags' => ['AIPerkembangan', 'IUKN2026'],
            ],
            [
                'title' => 'Starlink Generasi 3 Meluncur di Indonesia: Kecepatan Internet Tembus 1 Gbps di Daerah 3T',
                'slug' => 'starlink-gen-3-meluncur-indonesia',
                'category' => 'teknologi',
                'author' => 'Anisa Permata',
                'dateline' => 'Jakarta',
                'image' => 'photo-1516849841032-87cbac4d88f7',
                'excerpt' => 'Uji coba di wilayah terluar Papua dan NTT menunjukkan latensi di bawah 15ms dengan harga perangkat yang lebih efisien.',
                'paragraphs' => [
                    'Layanan satelit orbit bumi rendah Generasi 3 resmi beroperasi secara komersial di seluruh pelosok Indonesia hari ini.',
                    'Uji kecepatan teranyar di Wamena menunjukkan peningkatan performa hingga 4 kali lipat dibandingkan generasi awal. Hal ini diprediksi akan merevolusi akses edukasi dan medis jarak jauh di area pedalaman.',
                ],
                'trending' => true,
                'views' => 18400,
                'likes' => 215,
                'minutes_ago' => 95,
                'tags' => ['Starlink3'],
            ],
            [
                'title' => 'Rupiah Menguat Terhadap Dolar AS Seiring Lonjakan Ekspor EV Battery Indonesia',
                'slug' => 'rupiah-menguat-ekspor-ev-battery',
                'category' => 'ekonomi',
                'author' => 'Hendra Wijaya',
                'dateline' => 'Jakarta',
                'image' => 'photo-1611974789855-9c2a0a7236a3',
                'excerpt' => 'Nilai tukar Rupiah menyentuh level paling stabil tahun ini didorong bertambahnya investasi pabrik baterai listrik.',
                'paragraphs' => [
                    'Bank Indonesia mencatat transaksi perdagangan ekspor komponen kendaraan listrik melonjak 45% year-on-year pada kuartal ketiga.',
                    'Pasar merespons positif komitmen smelter berteknologi tinggi yang kini beroperasi secara penuh di Halmahera dan Sulawesi.',
                ],
                'trending' => true,
                'views' => 15200,
                'likes' => 190,
                'minutes_ago' => 240,
                'tags' => ['Ekonomi2026'],
            ],
            [
                'title' => 'Chip Kuantum QuantumX Buatan Anak Bangsa Diakui Lembaga Sains Internasional',
                'slug' => 'chip-kuantum-anak-bangsa',
                'category' => 'teknologi',
                'author' => 'Dian Pratama',
                'dateline' => 'Bandung',
                'image' => 'photo-1518770660439-4636190af475',
                'excerpt' => 'Inovasi arsitektur semikonduktor berdaya ultra-rendah buatan insinyur lulusan Bandung sukses menembus uji validasi ketat.',
                'paragraphs' => [
                    'Peneliti muda dari Konsorsium Semikonduktor Indonesia mengumumkan pencapaian chip pemroses kuantum mikro pertama.',
                    'Chip ini mampu menangani komputasi kompleks dengan konsumsi daya 60% lebih hemat dari standar industri.',
                ],
                'trending' => false,
                'views' => 12900,
                'likes' => 310,
                'minutes_ago' => 1500,
                'tags' => ['Semikonduktor'],
            ],
            [
                'title' => 'Transformasi Transportasi Cerdas: Mobil Otonom Resmi Diuji Coba di Jalan Protokol',
                'slug' => 'mobil-otonom-uji-coba-jakarta',
                'category' => 'sosial-politik',
                'author' => 'Rian Firmansyah',
                'dateline' => 'Jakarta',
                'image' => 'photo-1549317661-bd32c8ce0db2',
                'excerpt' => 'Uji coba koridor busway otonom tanpa pengemudi berjalan mulus dengan integrasi sensor lalu lintas AI terpusat.',
                'paragraphs' => [
                    'Dinas Perhubungan DKI Jakarta bermitra dengan penyedia armada otonom memulai fase uji coba jalur khusus.',
                    'Sebanyak 10 armada bus otonom dilengkapi sensor LiDAR canggih beroperasi melayani rute Sudirman-Thamrin tanpa kendala.',
                ],
                'trending' => true,
                'views' => 11200,
                'likes' => 180,
                'minutes_ago' => 1700,
                'tags' => ['MobilOtonom'],
            ],
            [
                'title' => 'Smartphone Layar Gulung Transparan Siap Masuk Pasar Indonesia Bulan Depan',
                'slug' => 'smartphone-layar-gulung-transparan',
                'category' => 'teknologi',
                'author' => 'Dian Pratama',
                'dateline' => 'Jakarta',
                'image' => 'photo-1511707171634-5f897ff02aa9',
                'excerpt' => 'Tren smartphone lipat bergeser ke teknologi layar OLED fleksibel gulung yang dapat mengembang hingga ukuran tablet 10 inci.',
                'paragraphs' => [
                    'Produsen elektronik global bersiap merilis gawai lipat generasi masa depan di Jakarta pekan depan.',
                    'Daya tarik utamanya adalah ketebalan hanya 4.8mm dengan panel OLED lentur anti gores.',
                ],
                'trending' => false,
                'views' => 9500,
                'likes' => 145,
                'minutes_ago' => 3000,
                'tags' => ['Smartphone'],
            ],
        ];
    }
}
