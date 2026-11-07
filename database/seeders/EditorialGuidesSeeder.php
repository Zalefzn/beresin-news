<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ArticleStatus;
use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Fifteen original, evergreen explainers (guides, not event news) published under the editorial admin account.
 * Safe to run more than once: articles whose slug already exists are skipped.
 */
class EditorialGuidesSeeder extends Seeder
{
    private const string UNSPLASH = 'https://images.unsplash.com/';

    private const string UNSPLASH_PARAMS = '?auto=format&fit=crop&w=1200&q=80';

    private const int MINUTES_BETWEEN_ARTICLES = 40;

    public function run(): void
    {
        config(['media-library.queue_conversions_by_default' => false]);

        $author = User::query()->where('role', UserRole::Admin)->orderBy('id')->firstOrFail();
        $categories = Category::query()->pluck('id', 'slug');

        foreach (self::articles() as $index => $data) {
            $slug = Str::slug($data['title']);

            if (Article::withTrashed()->where('slug', $slug)->exists()) {
                continue;
            }

            $article = Article::query()->create([
                'title' => $data['title'],
                'slug' => $slug,
                'dateline' => 'Jakarta',
                'excerpt' => $data['excerpt'],
                'body' => implode('', $data['body']),
                'cover_caption' => 'Foto ilustrasi: '.$data['title'],
                'cover_credit' => 'Unsplash',
                'category_id' => $categories[$data['category']],
                'author_id' => $author->id,
                'status' => ArticleStatus::Published,
                'published_at' => now()->subMinutes(($index + 1) * self::MINUTES_BETWEEN_ARTICLES),
                'meta_description' => $data['excerpt'],
            ]);

            $article->tags()->sync(collect($data['tags'])->map(
                fn (string $name): int => Tag::query()->firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id,
            ));

            $this->attachCover($article, $data['image']);
        }
    }

    private function attachCover(Article $article, string $photo): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        try {
            $article->addMediaFromUrl(self::UNSPLASH.$photo.self::UNSPLASH_PARAMS)
                ->usingFileName($article->slug.'.jpg')
                ->toMediaCollection('cover');
        } catch (Throwable $exception) {
            Log::warning('Gambar sampul gagal diunduh, artikel memakai placeholder.', [
                'article' => $article->slug,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * @return list<array{title: string, category: string, image: string, excerpt: string, tags: list<string>, body: list<string>}>
     */
    public static function articles(): array
    {
        return [
            [
                'title' => 'Cara Melindungi Data Pribadi di Ponsel: Langkah Sederhana yang Sering Terlupakan',
                'category' => 'teknologi',
                'image' => 'photo-1512941937669-90a1b58e7e9c',
                'excerpt' => 'Ponsel menyimpan hampir seluruh kehidupan digital kita. Berikut langkah praktis untuk menjaga data pribadi tetap aman, mulai dari kunci layar hingga izin aplikasi.',
                'tags' => ['KeamananDigital', 'DataPribadi', 'TipsTeknologi'],
                'body' => [
                    '<p>Ponsel kini menyimpan jauh lebih banyak hal daripada sekadar kontak dan foto. Aplikasi perbankan, dompet digital, surel kantor, hingga dokumen identitas sering kali tersimpan di satu perangkat yang kita bawa ke mana-mana. Ketika ponsel hilang atau dibobol, yang dipertaruhkan bukan hanya perangkatnya, melainkan juga identitas dan keuangan pemiliknya.</p>',
                    '<p>Indonesia sendiri telah memiliki Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi. Aturan ini mewajibkan pihak yang mengelola data untuk menjaganya. Namun, perlindungan paling dasar tetap berada di tangan pengguna. Berikut langkah-langkah sederhana yang sering terlupakan.</p>',
                    '<h2>1. Gunakan kunci layar yang kuat</h2>',
                    '<p>Pola sederhana atau PIN empat angka seperti tanggal lahir mudah ditebak. Gunakan PIN minimal enam digit atau kata sandi, lalu aktifkan sidik jari atau pengenal wajah sebagai pelengkap. Atur juga agar layar terkunci otomatis dalam 30 detik hingga satu menit setelah tidak digunakan.</p>',
                    '<h2>2. Periksa izin aplikasi secara berkala</h2>',
                    '<p>Banyak aplikasi meminta akses yang tidak relevan dengan fungsinya, misalnya aplikasi senter yang meminta akses kontak atau lokasi. Buka menu pengaturan privasi di ponsel, lalu tinjau aplikasi mana saja yang dapat mengakses kamera, mikrofon, lokasi, kontak, dan penyimpanan. Cabut izin yang tidak diperlukan.</p>',
                    '<h2>3. Pasang aplikasi hanya dari toko resmi</h2>',
                    '<p>File APK yang dikirim lewat pesan berantai, misalnya berkedok undangan pernikahan atau tagihan paket, kerap berisi program jahat yang mampu membaca SMS, termasuk kode OTP. Unduh aplikasi hanya dari Google Play Store atau App Store, dan jangan pernah memasang aplikasi dari tautan yang dikirim orang tak dikenal.</p>',
                    '<h2>4. Aktifkan verifikasi dua langkah</h2>',
                    '<p>Untuk akun surel, media sosial, dan aplikasi pesan, aktifkan verifikasi dua langkah. Dengan fitur ini, pelaku tetap tidak bisa masuk meskipun kata sandi Anda bocor, karena ia juga membutuhkan kode tambahan yang hanya dikirim ke perangkat Anda.</p>',
                    '<h2>5. Perbarui sistem dan aplikasi</h2>',
                    '<p>Pembaruan sistem operasi bukan sekadar menambah fitur. Sebagian besar pembaruan berisi perbaikan celah keamanan. Biasakan memasang pembaruan begitu tersedia, dan pertimbangkan mengganti ponsel yang sudah tidak lagi mendapat pembaruan keamanan dari produsennya.</p>',
                    '<h2>6. Siapkan rencana jika ponsel hilang</h2>',
                    '<p>Aktifkan fitur pelacak bawaan, seperti Temukan Perangkat Saya di Android atau Lacak di iPhone. Fitur ini memungkinkan Anda mengunci atau menghapus isi ponsel dari jarak jauh. Catat juga nomor layanan pelanggan bank dan operator seluler agar Anda bisa segera memblokir rekening dan kartu SIM.</p>',
                    '<h2>7. Waspadai Wi-Fi publik</h2>',
                    '<p>Jaringan Wi-Fi gratis di kafe atau bandara tidak selalu aman. Hindari membuka aplikasi perbankan atau memasukkan kata sandi saat terhubung ke jaringan publik. Jika terpaksa, gunakan data seluler pribadi.</p>',
                    '<p>Langkah-langkah di atas tidak membutuhkan keahlian khusus, hanya kebiasaan. Luangkan sepuluh menit hari ini untuk memeriksa pengaturan ponsel Anda. Waktu yang singkat itu jauh lebih murah dibandingkan repotnya memulihkan akun atau saldo yang telanjur hilang.</p>',
                ],
            ],
            [
                'title' => 'Mengenal Phishing: Ciri-ciri Pesan Penipuan dan Cara Menghindarinya',
                'category' => 'teknologi',
                'image' => 'photo-1516321318423-f06f85e504b3',
                'excerpt' => 'Phishing memanfaatkan kepanikan dan rasa penasaran untuk mencuri kata sandi serta data perbankan. Kenali ciri-cirinya agar tidak menjadi korban berikutnya.',
                'tags' => ['KeamananDigital', 'Penipuan', 'TipsTeknologi'],
                'body' => [
                    '<p>Phishing adalah upaya penipuan yang menyamar sebagai pihak tepercaya, seperti bank, kurir, instansi pemerintah, atau toko daring, untuk memancing korban menyerahkan data penting. Data yang diincar biasanya kata sandi, nomor kartu, kode OTP, atau akses ke akun media sosial. Istilah ini berasal dari kata fishing atau memancing, karena pelakunya melempar umpan dan menunggu ada yang terjebak.</p>',
                    '<p>Bentuknya terus berubah. Dulu phishing identik dengan surel berbahasa kaku. Kini pesan penipuan bisa datang lewat WhatsApp, SMS, telepon, bahkan iklan di media sosial, dengan tampilan yang nyaris sama dengan aslinya.</p>',
                    '<h2>Ciri-ciri pesan phishing</h2>',
                    '<ul><li><strong>Menciptakan rasa mendesak.</strong> Misalnya "Akun Anda akan diblokir dalam 24 jam" atau "Paket Anda tertahan, segera konfirmasi".</li><li><strong>Meminta data rahasia.</strong> Bank dan penyedia layanan resmi tidak pernah meminta PIN, kata sandi, atau kode OTP lewat pesan maupun telepon.</li><li><strong>Tautan yang janggal.</strong> Alamat situs mirip aslinya, tetapi ada huruf yang ditukar, tambahan kata, atau memakai domain gratisan.</li><li><strong>Hadiah yang terlalu bagus.</strong> Undian berhadiah mobil atau saldo gratis padahal Anda tidak pernah ikut undian apa pun.</li><li><strong>Lampiran mencurigakan.</strong> File berakhiran .apk, .exe, atau dokumen yang meminta Anda mengaktifkan makro.</li></ul>',
                    '<h2>Cara menghindarinya</h2>',
                    '<p>Pertama, berhenti sejenak. Penipu mengandalkan reaksi spontan, jadi jeda beberapa detik sebelum mengeklik sudah sangat membantu. Kedua, verifikasi lewat jalur resmi. Jika pesan mengaku dari bank, tutup pesannya lalu hubungi nomor layanan pelanggan yang tertera di balik kartu atau di situs resmi bank, bukan nomor yang tercantum di pesan.</p>',
                    '<p>Ketiga, periksa alamat situs sebelum memasukkan data. Ketik sendiri alamat situs resmi di peramban daripada mengikuti tautan. Ikon gembok di bilah alamat hanya menandakan koneksi terenkripsi, bukan jaminan bahwa situs tersebut asli.</p>',
                    '<p>Keempat, aktifkan verifikasi dua langkah di semua akun penting. Kelima, jangan pernah membagikan kode OTP kepada siapa pun, termasuk orang yang mengaku petugas.</p>',
                    '<h2>Jika telanjur menjadi korban</h2>',
                    '<p>Bertindaklah cepat. Segera hubungi bank untuk memblokir rekening atau kartu, lalu ganti kata sandi akun yang mungkin terdampak, dimulai dari surel utama. Keluarkan semua perangkat yang tidak dikenal dari akun Anda, dan simpan bukti berupa tangkapan layar pesan, nomor pengirim, serta bukti transfer.</p>',
                    '<p>Laporkan nomor atau rekening penipu ke bank terkait dan melalui kanal pengaduan resmi pemerintah. Laporan Anda membantu mencegah orang lain menjadi korban berikutnya.</p>',
                    '<p>Phishing akan terus berevolusi mengikuti teknologi. Namun, prinsip dasarnya tetap sama: jangan terburu-buru, jangan bagikan data rahasia, dan selalu verifikasi melalui jalur resmi.</p>',
                ],
            ],
            [
                'title' => 'Panduan Belanja Online yang Aman untuk Pemula',
                'category' => 'teknologi',
                'image' => 'photo-1563013544-824ae1b704d3',
                'excerpt' => 'Belanja daring praktis, tetapi juga membuka celah penipuan. Simak panduan memilih penjual, metode pembayaran, hingga langkah yang harus diambil bila barang tak sesuai.',
                'tags' => ['BelanjaOnline', 'KeamananDigital', 'TipsTeknologi'],
                'body' => [
                    '<p>Belanja daring sudah menjadi kebiasaan sehari-hari. Hampir semua kebutuhan, dari bahan makanan hingga perangkat elektronik, bisa dipesan lewat ponsel. Kemudahan ini sayangnya juga dimanfaatkan penipu, mulai dari toko palsu hingga barang yang tidak pernah dikirim. Berikut panduan agar pengalaman belanja daring tetap aman dan menyenangkan.</p>',
                    '<h2>Pilih platform dan penjual dengan cermat</h2>',
                    '<p>Utamakan berbelanja di lokapasar (marketplace) atau situs resmi merek yang sudah dikenal. Lokapasar umumnya menahan dana pembeli sampai barang diterima, sehingga ada perlindungan jika terjadi masalah. Sebelum membeli, periksa reputasi penjual: berapa lama toko berdiri, berapa banyak barang terjual, dan bagaimana ulasan pembeli lain. Ulasan yang seragam dan muncul dalam waktu berdekatan patut dicurigai.</p>',
                    '<h2>Waspadai harga yang tidak masuk akal</h2>',
                    '<p>Ponsel keluaran terbaru dengan harga separuh dari harga pasar hampir pasti bermasalah. Bisa jadi barangnya palsu, rekondisi, atau tidak pernah ada. Bandingkan harga di beberapa toko sebelum memutuskan.</p>',
                    '<h2>Jangan bertransaksi di luar aplikasi</h2>',
                    '<p>Modus yang sering terjadi: penjual mengajak pindah ke WhatsApp dan meminta transfer langsung ke rekening pribadi dengan iming-iming diskon. Begitu dana dikirim, perlindungan dari lokapasar hilang. Selesaikan seluruh transaksi di dalam aplikasi atau situs resmi.</p>',
                    '<h2>Gunakan metode pembayaran yang aman</h2>',
                    '<p>Pilih metode pembayaran yang disediakan platform, seperti virtual account, dompet digital, atau kartu yang terhubung dengan sistem pembayaran resmi. Untuk kartu kredit atau debit, aktifkan notifikasi transaksi agar Anda segera tahu jika ada pemakaian yang tidak dikenal. Jangan menyimpan data kartu di situs yang jarang Anda gunakan.</p>',
                    '<h2>Periksa alamat situs</h2>',
                    '<p>Toko palsu sering meniru tampilan situs merek terkenal dengan alamat yang sedikit berbeda. Pastikan alamat situs benar sebelum memasukkan data pembayaran, dan jangan berbelanja melalui tautan dari iklan atau pesan yang mencurigakan.</p>',
                    '<h2>Rekam video saat membuka paket</h2>',
                    '<p>Untuk barang bernilai tinggi, rekam video tanpa potongan sejak paket masih tersegel hingga isinya terlihat. Video ini menjadi bukti kuat saat mengajukan komplain atau pengembalian dana.</p>',
                    '<h2>Jika barang tidak sesuai</h2>',
                    '<p>Jangan langsung menekan tombol "pesanan diterima". Ajukan komplain melalui fitur yang tersedia di aplikasi dalam batas waktu yang ditentukan, lampirkan foto dan video, lalu ikuti proses mediasi. Selama dana masih ditahan platform, peluang mendapatkan pengembalian dana jauh lebih besar.</p>',
                    '<p>Belanja daring yang aman bergantung pada kebiasaan sederhana: bertransaksi di platform resmi, curiga pada harga yang terlalu murah, dan menyimpan bukti. Dengan begitu, kemudahan belanja daring bisa dinikmati tanpa rasa waswas.</p>',
                ],
            ],
            [
                'title' => 'Apa Itu Kecerdasan Buatan? Penjelasan Sederhana tentang Cara Kerja AI',
                'category' => 'teknologi',
                'image' => 'photo-1550751827-4bd374c3f58b',
                'excerpt' => 'Kecerdasan buatan ada di balik rekomendasi video, penerjemah, hingga chatbot. Begini cara kerjanya dijelaskan tanpa istilah rumit, beserta manfaat dan batasannya.',
                'tags' => ['AIPerkembangan', 'TipsTeknologi', 'LiterasiDigital'],
                'body' => [
                    '<p>Istilah kecerdasan buatan atau artificial intelligence (AI) kini muncul di mana-mana, dari fitur kamera ponsel hingga layanan pelanggan bank. Namun, banyak orang masih bertanya-tanya: sebenarnya apa itu AI, dan bagaimana mesin bisa tampak "berpikir"?</p>',
                    '<h2>Definisi sederhana</h2>',
                    '<p>Secara sederhana, AI adalah bidang ilmu komputer yang membuat sistem mampu mengerjakan tugas yang biasanya membutuhkan kecerdasan manusia. Contohnya mengenali wajah, memahami bahasa, menerjemahkan teks, atau memberi rekomendasi. AI bukan otak buatan yang sadar, melainkan kumpulan teknik matematika dan statistik yang dijalankan komputer.</p>',
                    '<h2>Belajar dari data</h2>',
                    '<p>Sebagian besar AI modern menggunakan pendekatan yang disebut pembelajaran mesin (machine learning). Alih-alih diberi aturan satu per satu, sistem diberi contoh dalam jumlah besar. Agar bisa mengenali foto kucing, misalnya, sistem dilatih dengan ribuan foto berlabel "kucing" dan "bukan kucing". Dari contoh-contoh itu, sistem menemukan pola sendiri, seperti bentuk telinga, mata, dan tekstur bulu.</p>',
                    '<p>Salah satu teknik yang paling banyak dipakai adalah jaringan saraf tiruan (neural network), yaitu struktur berlapis yang terinspirasi secara longgar dari cara kerja neuron di otak. Ketika jaringan ini dibuat sangat besar dan berlapis-lapis, pendekatannya disebut deep learning.</p>',
                    '<h2>AI generatif dan chatbot</h2>',
                    '<p>Chatbot yang bisa menulis esai atau menjawab pertanyaan termasuk AI generatif. Sistem ini dilatih dengan teks dalam jumlah sangat besar sehingga mampu memprediksi kata demi kata yang paling sesuai untuk menyusun jawaban. Karena bekerja berdasarkan pola, hasilnya terdengar meyakinkan, tetapi tidak selalu benar.</p>',
                    '<h2>Contoh AI dalam keseharian</h2>',
                    '<ul><li>Rekomendasi video, lagu, dan produk di aplikasi.</li><li>Penerjemah otomatis dan teks terjemahan pada video.</li><li>Filter spam di kotak masuk surel.</li><li>Navigasi peta yang memperkirakan kemacetan.</li><li>Deteksi transaksi mencurigakan di layanan perbankan.</li></ul>',
                    '<h2>Batasan yang perlu dipahami</h2>',
                    '<p>AI hanya sebaik data yang digunakan untuk melatihnya. Jika datanya bias atau tidak lengkap, hasilnya pun bisa bias. AI generatif juga dapat "berhalusinasi", yakni menyajikan informasi keliru dengan nada yakin. Karena itu, hasil AI sebaiknya diperlakukan sebagai bahan awal yang tetap perlu diperiksa, terutama untuk urusan kesehatan, hukum, dan keuangan.</p>',
                    '<p>Isu lain yang ramai dibahas adalah privasi data, hak cipta, serta penyalahgunaan AI untuk membuat konten palsu seperti deepfake. Literasi digital menjadi kunci agar masyarakat bisa memanfaatkan AI secara bijak.</p>',
                    '<h2>Memanfaatkan AI dengan bijak</h2>',
                    '<p>Gunakan AI sebagai alat bantu, bukan pengganti penilaian Anda sendiri. Jangan memasukkan data pribadi atau rahasia perusahaan ke layanan AI publik, periksa ulang fakta penting dari sumber tepercaya, dan sebutkan dengan jujur bila sebuah karya dibuat dengan bantuan AI. Dengan pemahaman yang tepat, AI bisa menjadi alat yang sangat membantu dalam pekerjaan dan pembelajaran.</p>',
                ],
            ],
            [
                'title' => 'Teknik Belajar Efektif: Pomodoro, Active Recall, dan Spaced Repetition',
                'category' => 'edukasi-pendidikan',
                'image' => 'photo-1434030216411-0b793f4b4173',
                'excerpt' => 'Belajar lama belum tentu efektif. Tiga teknik ini membantu pelajar dan mahasiswa mengingat materi lebih lama dengan waktu belajar yang lebih singkat.',
                'tags' => ['TipsBelajar', 'Pelajar', 'Pendidikan'],
                'body' => [
                    '<p>Banyak pelajar menghabiskan berjam-jam membaca ulang buku catatan menjelang ujian, tetapi materinya tetap cepat terlupa. Masalahnya sering kali bukan pada lamanya belajar, melainkan caranya. Tiga teknik berikut banyak direkomendasikan karena membantu otak menyimpan informasi lebih lama.</p>',
                    '<h2>1. Teknik Pomodoro: belajar dalam sesi pendek</h2>',
                    '<p>Teknik Pomodoro membagi waktu belajar menjadi sesi fokus selama 25 menit, diikuti istirahat lima menit. Setelah empat sesi, ambil istirahat lebih panjang sekitar 15 hingga 30 menit. Nama Pomodoro berasal dari pengatur waktu dapur berbentuk tomat yang dipakai penciptanya.</p>',
                    '<p>Kuncinya ada pada fokus penuh selama sesi berlangsung. Jauhkan ponsel, tutup tab media sosial, dan kerjakan satu hal saja. Sesi yang pendek membuat tugas besar terasa lebih ringan untuk dimulai, sementara jeda rutin mencegah kelelahan.</p>',
                    '<h2>2. Active recall: menguji diri sendiri</h2>',
                    '<p>Active recall adalah kebiasaan mengingat kembali materi tanpa melihat catatan. Caranya, setelah membaca satu bab, tutup buku lalu tuliskan atau ucapkan apa saja yang Anda ingat. Bisa juga dengan membuat kartu tanya-jawab (flashcard) atau mengerjakan latihan soal.</p>',
                    '<p>Teknik ini terasa lebih berat daripada membaca ulang, dan justru itulah kekuatannya. Upaya menarik informasi dari ingatan memperkuat jejak memori. Membaca ulang sering memberi rasa "sudah paham" yang semu karena materinya terasa familier.</p>',
                    '<h2>3. Spaced repetition: mengulang dengan jarak</h2>',
                    '<p>Otak cenderung melupakan informasi baru dengan cepat jika tidak diulang. Spaced repetition mengatasinya dengan mengulang materi pada jarak waktu yang makin panjang, misalnya satu hari setelah belajar, lalu tiga hari, satu minggu, dan dua minggu kemudian.</p>',
                    '<p>Daripada belajar semalam suntuk sebelum ujian, membagi waktu belajar menjadi beberapa sesi singkat dalam beberapa minggu umumnya memberi hasil yang lebih awet. Ada pula aplikasi flashcard yang otomatis mengatur jadwal pengulangan ini.</p>',
                    '<h2>Menggabungkan ketiganya</h2>',
                    '<p>Ketiga teknik ini saling melengkapi. Gunakan sesi Pomodoro sebagai wadah, isi sesi itu dengan active recall seperti latihan soal atau flashcard, lalu jadwalkan pengulangan dengan prinsip spaced repetition. Contohnya, satu sesi 25 menit untuk merangkum bab baru dari ingatan, kemudian sesi berikutnya untuk mengulang flashcard bab minggu lalu.</p>',
                    '<h2>Jangan lupakan dasar-dasarnya</h2>',
                    '<p>Teknik belajar terbaik pun tidak akan maksimal tanpa tidur yang cukup, makan teratur, dan aktivitas fisik. Tidur berperan penting dalam memperkuat ingatan, sehingga begadang sebelum ujian justru bisa merugikan.</p>',
                    '<p>Mulailah dari satu teknik terlebih dahulu, misalnya Pomodoro, lalu tambahkan teknik lain setelah terbiasa. Perubahan kecil pada cara belajar bisa membawa perbedaan besar pada hasilnya.</p>',
                ],
            ],
            [
                'title' => 'Tips Memilih Jurusan Kuliah agar Tidak Salah Langkah',
                'category' => 'edukasi-pendidikan',
                'image' => 'photo-1522202176988-66273c2fd55f',
                'excerpt' => 'Memilih jurusan kuliah menentukan beberapa tahun ke depan. Kenali minat, kemampuan, dan prospek kerja sebelum mengambil keputusan.',
                'tags' => ['Kuliah', 'Pelajar', 'Pendidikan'],
                'body' => [
                    '<p>Bagi siswa kelas akhir SMA, SMK, dan MA, memilih jurusan kuliah sering menjadi keputusan besar pertama dalam hidup. Tidak sedikit mahasiswa yang merasa salah jurusan setelah beberapa semester, lalu memilih bertahan dengan setengah hati atau pindah dan memulai dari awal. Berikut sejumlah langkah agar pilihan Anda lebih matang.</p>',
                    '<h2>Kenali minat dan kemampuan diri</h2>',
                    '<p>Mulailah dengan pertanyaan sederhana: pelajaran apa yang paling Anda nikmati, kegiatan apa yang membuat Anda lupa waktu, dan di bidang apa nilai Anda konsisten baik? Minat tanpa kemampuan akan terasa berat, sedangkan kemampuan tanpa minat bisa cepat membosankan. Jurusan ideal biasanya berada di titik temu keduanya.</p>',
                    '<p>Tes minat dan bakat dari guru bimbingan konseling atau lembaga psikologi bisa menjadi bahan pertimbangan, tetapi jangan dijadikan satu-satunya penentu.</p>',
                    '<h2>Pelajari isi kuliahnya, bukan hanya namanya</h2>',
                    '<p>Nama jurusan sering kali tidak menggambarkan isi perkuliahan sepenuhnya. Jurusan Psikologi, misalnya, banyak mempelajari statistik dan metode penelitian. Teknik Informatika tidak hanya soal membuat aplikasi, tetapi juga matematika diskrit dan algoritma. Buka situs resmi program studi dan baca daftar mata kuliahnya dari semester awal hingga akhir.</p>',
                    '<h2>Bicara dengan mahasiswa dan alumni</h2>',
                    '<p>Cara terbaik memahami sebuah jurusan adalah bertanya langsung kepada orang yang menjalaninya. Tanyakan beban tugas, suasana belajar, biaya praktikum, hingga pekerjaan yang diambil para lulusannya. Banyak kampus juga membuka acara kunjungan atau pameran pendidikan yang bisa dimanfaatkan.</p>',
                    '<h2>Pertimbangkan prospek kerja secara realistis</h2>',
                    '<p>Prospek kerja penting, tetapi jangan hanya ikut tren. Jurusan yang sedang populer belum tentu cocok untuk Anda, dan dunia kerja terus berubah. Keterampilan seperti kemampuan menulis, berpikir kritis, berbahasa asing, dan mengolah data dibutuhkan di hampir semua bidang, apa pun jurusannya.</p>',
                    '<h2>Hitung biaya dan peluang beasiswa</h2>',
                    '<p>Diskusikan dengan keluarga mengenai biaya kuliah, biaya hidup, dan lokasi kampus. Cari tahu juga beasiswa yang tersedia, baik dari pemerintah, kampus, maupun swasta, beserta persyaratan dan jadwal pendaftarannya.</p>',
                    '<h2>Siapkan strategi seleksi</h2>',
                    '<p>Pelajari jalur seleksi masuk perguruan tinggi negeri maupun swasta, termasuk jadwal, persyaratan, dan daya tampung tiap program studi. Susun pilihan secara strategis dengan menyeimbangkan program studi impian dan pilihan yang peluangnya lebih realistis.</p>',
                    '<h2>Dengarkan masukan, tetapi putuskan sendiri</h2>',
                    '<p>Masukan dari orang tua dan guru sangat berharga, tetapi yang akan menjalani perkuliahan adalah Anda. Sampaikan alasan pilihan Anda dengan data dan pertimbangan yang jelas agar diskusi berjalan lebih terbuka.</p>',
                    '<p>Tidak ada pilihan yang menjamin semuanya berjalan sempurna. Namun, keputusan yang didasari riset dan pengenalan diri akan jauh lebih mudah dipertanggungjawabkan dan dijalani dengan sepenuh hati.</p>',
                ],
            ],
            [
                'title' => 'Cara Menulis CV untuk Lulusan Baru yang Dilirik Perekrut',
                'category' => 'edukasi-pendidikan',
                'image' => 'photo-1559526324-4b87b5e36e44',
                'excerpt' => 'Belum punya pengalaman kerja bukan berarti CV harus kosong. Begini cara lulusan baru menyusun CV yang ringkas, rapi, dan menonjolkan potensi.',
                'tags' => ['Karier', 'LulusanBaru', 'Pendidikan'],
                'body' => [
                    '<p>Bagi lulusan baru, menulis daftar riwayat hidup atau curriculum vitae (CV) sering terasa membingungkan. Belum ada pengalaman kerja penuh waktu, lalu apa yang harus ditulis? Kabar baiknya, perekrut memahami kondisi ini. Yang mereka cari dari lulusan baru adalah potensi, kemauan belajar, dan bukti bahwa Anda pernah mengerjakan sesuatu dengan sungguh-sungguh.</p>',
                    '<h2>Struktur CV yang disarankan</h2>',
                    '<ul><li><strong>Identitas dan kontak:</strong> nama lengkap, nomor telepon, surel yang profesional, kota domisili, dan tautan LinkedIn atau portofolio bila ada.</li><li><strong>Ringkasan profil:</strong> dua sampai tiga kalimat tentang latar belakang pendidikan, keahlian utama, dan bidang yang diminati.</li><li><strong>Pendidikan:</strong> nama kampus, program studi, tahun lulus, dan IPK jika cukup baik.</li><li><strong>Pengalaman:</strong> magang, organisasi, kepanitiaan, proyek kuliah, kerja paruh waktu, atau kegiatan sukarela.</li><li><strong>Keahlian:</strong> keterampilan teknis dan bahasa yang relevan dengan posisi yang dilamar.</li><li><strong>Sertifikat dan prestasi:</strong> pelatihan, kursus daring, atau lomba yang pernah diikuti.</li></ul>',
                    '<h2>Tunjukkan hasil, bukan sekadar tugas</h2>',
                    '<p>Kesalahan umum adalah menuliskan daftar tugas, misalnya "bertanggung jawab atas media sosial himpunan". Ubahlah menjadi pencapaian yang terukur, seperti "mengelola akun Instagram himpunan dan menaikkan jumlah pengikut dari 800 menjadi 2.500 dalam satu tahun". Angka membuat pengalaman Anda lebih meyakinkan.</p>',
                    '<h2>Sesuaikan dengan lowongan</h2>',
                    '<p>Jangan mengirim CV yang sama untuk semua lowongan. Baca deskripsi pekerjaan dengan teliti, lalu tonjolkan pengalaman dan keahlian yang paling relevan. Banyak perusahaan memakai sistem penyaringan otomatis (applicant tracking system), sehingga menggunakan istilah yang sesuai dengan deskripsi lowongan dapat membantu CV Anda lolos tahap awal.</p>',
                    '<h2>Ringkas dan rapi</h2>',
                    '<p>Untuk lulusan baru, satu halaman sudah cukup. Gunakan format yang bersih dengan huruf yang mudah dibaca dan susunan yang konsisten. Hindari desain yang terlalu ramai, terutama jika melamar lewat portal yang membaca CV secara otomatis. Simpan dalam format PDF dengan nama file yang jelas, misalnya "CV_NamaLengkap.pdf".</p>',
                    '<h2>Periksa sebelum mengirim</h2>',
                    '<p>Salah ketik dan informasi kontak yang keliru bisa menggagalkan lamaran. Baca ulang CV Anda beberapa kali, lalu minta teman atau dosen membacanya. Pastikan juga semua informasi yang ditulis jujur dan bisa Anda jelaskan saat wawancara.</p>',
                    '<h2>Lengkapi dengan surat lamaran</h2>',
                    '<p>Bila diminta, sertakan surat lamaran singkat yang menjelaskan mengapa Anda tertarik pada posisi tersebut dan apa yang bisa Anda kontribusikan. Surat yang ditulis khusus untuk perusahaan yang dituju akan lebih menarik dibandingkan templat umum.</p>',
                    '<p>CV adalah pintu masuk pertama menuju wawancara. Dengan susunan yang rapi dan isi yang menonjolkan potensi, peluang lulusan baru untuk dilirik perekrut akan jauh lebih besar.</p>',
                ],
            ],
            [
                'title' => 'Peran Orang Tua dalam Mendampingi Anak Belajar di Rumah',
                'category' => 'edukasi-pendidikan',
                'image' => 'photo-1503676260728-1c00da094a0b',
                'excerpt' => 'Pendampingan orang tua tidak berarti mengerjakan PR anak. Simak cara menciptakan suasana belajar yang mendukung kemandirian dan rasa ingin tahu anak.',
                'tags' => ['Parenting', 'Pendidikan', 'TipsBelajar'],
                'body' => [
                    '<p>Sekolah memang menjadi tempat utama anak belajar, tetapi rumah memegang peran yang tidak kalah penting. Kebiasaan, suasana, dan sikap orang tua di rumah sangat memengaruhi semangat belajar anak. Sayangnya, pendampingan sering disalahartikan sebagai mengawasi ketat atau bahkan mengerjakan pekerjaan rumah anak.</p>',
                    '<h2>Ciptakan rutinitas yang konsisten</h2>',
                    '<p>Anak lebih mudah fokus ketika memiliki jadwal yang jelas. Sepakati waktu belajar harian, misalnya setelah istirahat sore, dan usahakan dijalankan secara konsisten. Rutinitas membantu anak memahami bahwa belajar adalah bagian wajar dari keseharian, bukan hukuman.</p>',
                    '<h2>Siapkan tempat belajar yang nyaman</h2>',
                    '<p>Tidak perlu ruangan khusus. Cukup satu sudut yang terang, tenang, dan jauh dari televisi. Pastikan alat tulis tersedia agar anak tidak perlu bolak-balik mencari, dan jauhkan gawai yang tidak digunakan untuk belajar.</p>',
                    '<h2>Dampingi, jangan mengambil alih</h2>',
                    '<p>Saat anak kesulitan, ajukan pertanyaan yang memancing ia berpikir, seperti "Menurutmu langkah pertamanya apa?" atau "Coba baca lagi soalnya, apa yang ditanyakan?". Membiarkan anak mencoba dan sesekali keliru adalah bagian dari proses belajar. Mengerjakan tugas untuk anak mungkin terasa membantu, tetapi justru menghilangkan kesempatannya untuk memahami materi.</p>',
                    '<h2>Hargai usaha, bukan hanya nilai</h2>',
                    '<p>Pujian yang berfokus pada usaha, misalnya "Kamu tekun sekali mengerjakan soal ini", mendorong anak untuk terus berusaha. Sebaliknya, terlalu menekankan nilai bisa membuat anak takut gagal dan enggan mencoba hal yang menantang.</p>',
                    '<h2>Jadikan membaca sebagai kebiasaan keluarga</h2>',
                    '<p>Anak meniru apa yang dilihatnya. Orang tua yang terbiasa membaca buku akan lebih mudah menularkan kebiasaan yang sama. Sediakan waktu membaca bersama, kunjungi perpustakaan, dan biarkan anak memilih buku sesuai minatnya.</p>',
                    '<h2>Atur penggunaan gawai</h2>',
                    '<p>Gawai bisa menjadi sumber belajar yang kaya, tetapi juga sumber gangguan terbesar. Buat kesepakatan bersama tentang durasi dan jenis tontonan, serta dampingi anak saat menjelajah internet sesuai usianya.</p>',
                    '<h2>Jalin komunikasi dengan guru</h2>',
                    '<p>Guru dapat memberi gambaran tentang perkembangan anak di sekolah, termasuk hal-hal yang mungkin tidak terlihat di rumah. Manfaatkan pertemuan wali murid atau grup komunikasi kelas untuk bertanya dan berdiskusi secara terbuka.</p>',
                    '<h2>Perhatikan kondisi emosional anak</h2>',
                    '<p>Penurunan semangat belajar bisa jadi tanda anak sedang lelah, merasa tertekan, atau mengalami masalah dengan teman. Luangkan waktu untuk mengobrol santai dan dengarkan ceritanya tanpa menghakimi.</p>',
                    '<p>Pendampingan yang baik tidak menuntut orang tua menguasai semua mata pelajaran. Yang dibutuhkan anak adalah kehadiran, kesabaran, dan lingkungan yang membuatnya merasa aman untuk belajar dan bertanya.</p>',
                ],
            ],
            [
                'title' => 'Menyusun Anggaran Bulanan dengan Metode 50/30/20',
                'category' => 'ekonomi',
                'image' => 'photo-1554224155-6726b3ff858f',
                'excerpt' => 'Gaji sering habis sebelum akhir bulan? Metode 50/30/20 membantu membagi penghasilan untuk kebutuhan, keinginan, dan tabungan dengan cara yang sederhana.',
                'tags' => ['KeuanganPribadi', 'TipsKeuangan', 'Ekonomi'],
                'body' => [
                    '<p>Banyak orang merasa penghasilannya selalu habis sebelum akhir bulan, padahal tidak merasa boros. Sering kali masalahnya bukan pada besar kecilnya penghasilan, melainkan tidak adanya rencana yang jelas. Salah satu cara paling sederhana untuk mulai mengatur keuangan adalah metode anggaran 50/30/20.</p>',
                    '<h2>Apa itu metode 50/30/20?</h2>',
                    '<p>Metode ini membagi penghasilan bersih, yaitu penghasilan setelah dipotong pajak dan iuran wajib, ke dalam tiga pos:</p>',
                    '<ul><li><strong>50% untuk kebutuhan:</strong> pengeluaran wajib seperti makan, sewa atau cicilan rumah, listrik, air, transportasi, pulsa, dan cicilan utang minimum.</li><li><strong>30% untuk keinginan:</strong> pengeluaran yang membuat hidup lebih menyenangkan tetapi tidak wajib, seperti makan di luar, hiburan, langganan streaming, dan belanja hobi.</li><li><strong>20% untuk tabungan dan investasi:</strong> dana darurat, tabungan tujuan, investasi, serta pelunasan utang di atas cicilan minimum.</li></ul>',
                    '<h2>Contoh penerapan</h2>',
                    '<p>Misalnya penghasilan bersih Anda Rp6.000.000 per bulan. Dengan metode ini, Rp3.000.000 dialokasikan untuk kebutuhan, Rp1.800.000 untuk keinginan, dan Rp1.200.000 untuk tabungan serta investasi.</p>',
                    '<h2>Langkah memulai</h2>',
                    '<p>Pertama, catat seluruh pengeluaran selama satu bulan tanpa mengubah kebiasaan. Langkah ini penting untuk mengetahui ke mana sebenarnya uang Anda pergi. Kedua, kelompokkan pengeluaran tersebut ke dalam tiga pos di atas. Ketiga, bandingkan dengan porsi ideal dan tentukan pos mana yang perlu disesuaikan.</p>',
                    '<p>Agar lebih disiplin, sisihkan porsi tabungan di awal bulan, tepat setelah gajian, bukan menunggu sisa di akhir bulan. Memisahkan rekening untuk kebutuhan, keinginan, dan tabungan juga dapat membantu.</p>',
                    '<h2>Bukan aturan mati</h2>',
                    '<p>Angka 50/30/20 adalah panduan, bukan aturan baku. Di kota dengan biaya hidup tinggi, kebutuhan pokok bisa melebihi 50 persen penghasilan. Dalam kondisi seperti itu, porsi keinginan bisa dikurangi sementara porsi tabungan tetap dijaga semampunya. Sebaliknya, jika kebutuhan Anda di bawah 50 persen, kelebihannya bisa dialihkan ke tabungan.</p>',
                    '<h2>Kesalahan yang sering terjadi</h2>',
                    '<p>Kesalahan paling umum adalah menggolongkan keinginan sebagai kebutuhan, misalnya menganggap ponsel baru atau kopi kekinian setiap hari sebagai kebutuhan. Kesalahan lain adalah tidak memasukkan pengeluaran tahunan, seperti pajak kendaraan atau biaya sekolah, sehingga anggaran tiba-tiba jebol di bulan tertentu. Bagi pengeluaran tahunan menjadi cicilan bulanan dan masukkan ke pos kebutuhan.</p>',
                    '<p>Metode 50/30/20 bekerja karena sederhana dan mudah diingat. Mulailah bulan ini, evaluasi setiap akhir bulan, lalu sesuaikan dengan kondisi Anda. Konsistensi jauh lebih penting daripada kesempurnaan.</p>',
                ],
            ],
            [
                'title' => 'Dana Darurat: Berapa yang Ideal dan Bagaimana Cara Mengumpulkannya',
                'category' => 'ekonomi',
                'image' => 'photo-1579621970563-ebec7560ff3e',
                'excerpt' => 'Kehilangan pekerjaan atau sakit mendadak bisa mengguncang keuangan keluarga. Dana darurat adalah bantalan pertama. Ini cara menghitung dan mengumpulkannya.',
                'tags' => ['KeuanganPribadi', 'TipsKeuangan', 'Ekonomi'],
                'body' => [
                    '<p>Tidak ada yang tahu kapan musibah datang. Pemutusan hubungan kerja, sakit yang membutuhkan biaya besar, kendaraan rusak, atau kebutuhan mendesak keluarga bisa muncul tanpa peringatan. Tanpa persiapan, banyak orang terpaksa berutang, menjual aset dengan harga murah, atau bahkan terjebak pinjaman online ilegal. Di sinilah dana darurat berperan.</p>',
                    '<h2>Apa itu dana darurat?</h2>',
                    '<p>Dana darurat adalah simpanan yang khusus disiapkan untuk keadaan mendesak yang tidak terduga. Dana ini bukan untuk liburan, membeli gawai baru, atau memanfaatkan diskon. Fungsinya menjaga agar kebutuhan pokok tetap terpenuhi saat penghasilan terganggu.</p>',
                    '<h2>Berapa jumlah yang ideal?</h2>',
                    '<p>Perencana keuangan umumnya menyarankan dana darurat dihitung berdasarkan pengeluaran bulanan, bukan penghasilan. Sebagai panduan umum:</p>',
                    '<ul><li><strong>Lajang:</strong> sekitar 3 hingga 6 kali pengeluaran bulanan.</li><li><strong>Menikah tanpa anak:</strong> sekitar 6 hingga 9 kali pengeluaran bulanan.</li><li><strong>Menikah dengan anak:</strong> sekitar 9 hingga 12 kali pengeluaran bulanan.</li></ul>',
                    '<p>Pekerja lepas, pemilik usaha, atau mereka yang penghasilannya tidak tetap sebaiknya menyiapkan jumlah di batas atas, karena pendapatannya lebih sulit diprediksi.</p>',
                    '<p>Contohnya, jika pengeluaran rutin keluarga Anda Rp5.000.000 per bulan dan Anda sudah menikah dengan satu anak, target dana darurat berkisar Rp45.000.000 hingga Rp60.000.000.</p>',
                    '<h2>Cara mengumpulkannya</h2>',
                    '<p>Angka tersebut mungkin terlihat besar, tetapi dana darurat tidak harus terkumpul sekaligus. Tetapkan target bertahap, misalnya satu bulan pengeluaran terlebih dahulu, lalu tiga bulan, dan seterusnya.</p>',
                    '<p>Sisihkan secara otomatis setiap bulan begitu gaji masuk, misalnya 10 persen dari penghasilan. Fitur pendebetan otomatis di bank sangat membantu agar Anda tidak tergoda menunda. Bonus, tunjangan hari raya, atau penghasilan tambahan juga bisa dialokasikan sebagian untuk mempercepat target.</p>',
                    '<h2>Di mana sebaiknya disimpan?</h2>',
                    '<p>Dana darurat harus mudah dicairkan dan nilainya stabil. Pilihan yang umum adalah tabungan terpisah dari rekening harian, deposito berjangka pendek, atau reksa dana pasar uang. Hindari menyimpannya di instrumen yang nilainya naik turun tajam, seperti saham, karena saat dibutuhkan nilainya bisa sedang turun.</p>',
                    '<p>Pastikan pula produk yang Anda pilih berasal dari lembaga yang terdaftar dan diawasi Otoritas Jasa Keuangan (OJK).</p>',
                    '<h2>Isi kembali setelah dipakai</h2>',
                    '<p>Jika dana darurat terpakai, jadikan pengisiannya kembali sebagai prioritas sebelum menambah investasi atau pengeluaran lain. Dana darurat yang terjaga memberi ketenangan pikiran, sekaligus melindungi rencana keuangan jangka panjang Anda dari guncangan mendadak.</p>',
                ],
            ],
            [
                'title' => 'Mengenal Investasi untuk Pemula: Reksa Dana, SBN Ritel, dan Saham',
                'category' => 'ekonomi',
                'image' => 'photo-1460925895917-afdab827c52f',
                'excerpt' => 'Ingin mulai berinvestasi tetapi bingung memilih? Kenali tiga instrumen yang populer di kalangan pemula beserta karakter risiko dan cara memulainya.',
                'tags' => ['Investasi', 'KeuanganPribadi', 'Ekonomi'],
                'body' => [
                    '<p>Investasi kini makin mudah diakses. Dengan modal puluhan ribu rupiah dan aplikasi di ponsel, siapa pun bisa mulai berinvestasi. Namun, kemudahan ini perlu diimbangi pemahaman yang cukup agar tidak salah langkah. Berikut pengenalan tiga instrumen yang banyak dipilih pemula.</p>',
                    '<h2>Sebelum berinvestasi</h2>',
                    '<p>Pastikan kondisi keuangan dasar sudah sehat: utang konsumtif terkendali dan dana darurat tersedia. Investasi menggunakan uang dingin, yaitu dana yang tidak akan dibutuhkan dalam waktu dekat. Tentukan juga tujuan dan jangka waktunya, misalnya dana pendidikan anak dalam sepuluh tahun atau uang muka rumah dalam lima tahun.</p>',
                    '<h2>1. Reksa dana</h2>',
                    '<p>Reksa dana adalah wadah yang menghimpun dana dari banyak investor, kemudian dikelola oleh manajer investasi profesional. Jenisnya beragam sesuai tingkat risiko:</p>',
                    '<ul><li><strong>Reksa dana pasar uang:</strong> risiko paling rendah, cocok untuk tujuan jangka pendek.</li><li><strong>Reksa dana pendapatan tetap:</strong> sebagian besar berisi obligasi, risikonya menengah.</li><li><strong>Reksa dana campuran:</strong> kombinasi saham dan obligasi.</li><li><strong>Reksa dana saham:</strong> potensi imbal hasil paling tinggi, tetapi nilainya paling fluktuatif, sehingga cocok untuk jangka panjang.</li></ul>',
                    '<h2>2. Surat Berharga Negara (SBN) ritel</h2>',
                    '<p>SBN ritel adalah surat utang yang diterbitkan pemerintah untuk investor perorangan, seperti ORI, Sukuk Ritel, Savings Bond Ritel, dan Sukuk Tabungan. Pembayaran bunga atau imbal hasil serta pokoknya dijamin negara sesuai ketentuan undang-undang. SBN ritel diterbitkan pada periode tertentu dan dapat dibeli melalui mitra distribusi resmi, seperti bank dan perusahaan sekuritas.</p>',
                    '<h2>3. Saham</h2>',
                    '<p>Membeli saham berarti memiliki sebagian kecil perusahaan yang tercatat di Bursa Efek Indonesia. Keuntungan bisa diperoleh dari kenaikan harga saham dan pembagian dividen. Namun, harga saham dapat naik dan turun tajam dalam waktu singkat. Pembelian dilakukan melalui perusahaan sekuritas dalam satuan lot, dengan satu lot setara 100 lembar saham.</p>',
                    '<p>Bagi pemula, sebaiknya pelajari dasar-dasar analisis perusahaan, mulai dengan dana kecil, dan hindari membeli saham hanya karena ikut-ikutan rekomendasi di media sosial.</p>',
                    '<h2>Prinsip penting untuk pemula</h2>',
                    '<p><strong>Diversifikasi.</strong> Jangan menaruh seluruh dana di satu instrumen. Menyebar investasi membantu mengurangi risiko.</p>',
                    '<p><strong>Pahami produknya.</strong> Jangan membeli sesuatu yang tidak Anda mengerti cara kerjanya.</p>',
                    '<p><strong>Rutin dan konsisten.</strong> Berinvestasi dalam jumlah tetap secara berkala dapat membantu meredam pengaruh naik-turunnya harga.</p>',
                    '<p><strong>Cek legalitas.</strong> Pastikan aplikasi dan lembaga yang Anda gunakan terdaftar dan diawasi OJK. Waspadai tawaran dengan imbal hasil tetap yang sangat tinggi dan dijanjikan tanpa risiko, karena ciri seperti itu kerap ditemukan pada investasi bodong.</p>',
                    '<p>Investasi adalah perjalanan jangka panjang. Mulailah dari instrumen yang paling Anda pahami, terus belajar, dan sesuaikan pilihan dengan tujuan serta profil risiko Anda.</p>',
                ],
            ],
            [
                'title' => 'Langkah Memulai Usaha Kecil dan Membawanya ke Ranah Digital',
                'category' => 'ekonomi',
                'image' => 'photo-1556742049-0cfed4f6a45d',
                'excerpt' => 'Dari mengurus izin usaha hingga berjualan di lokapasar, berikut panduan praktis bagi pelaku usaha kecil yang ingin tumbuh lewat kanal digital.',
                'tags' => ['UMKM', 'Bisnis', 'Ekonomi'],
                'body' => [
                    '<p>Usaha mikro, kecil, dan menengah (UMKM) merupakan tulang punggung perekonomian Indonesia dan menyerap sebagian besar tenaga kerja. Banyak usaha besar pun bermula dari dapur rumah atau lapak kecil. Bagi Anda yang ingin memulai atau mengembangkan usaha, berikut langkah-langkah praktisnya.</p>',
                    '<h2>1. Mulai dari masalah yang nyata</h2>',
                    '<p>Usaha yang bertahan biasanya menjawab kebutuhan yang jelas. Amati lingkungan sekitar: produk atau layanan apa yang sulit dicari, terlalu mahal, atau kurang memuaskan? Uji ide Anda dalam skala kecil terlebih dahulu, misalnya menjual ke teman dan tetangga, sebelum menanamkan modal besar.</p>',
                    '<h2>2. Hitung modal dan harga jual dengan cermat</h2>',
                    '<p>Catat semua biaya, termasuk bahan baku, kemasan, ongkos kirim, potongan biaya platform, hingga tenaga kerja Anda sendiri. Harga jual harus menutup seluruh biaya tersebut dan masih menyisakan keuntungan. Banyak usaha kecil merasa laris tetapi sebenarnya merugi karena tidak menghitung biaya secara lengkap.</p>',
                    '<h2>3. Pisahkan uang usaha dan uang pribadi</h2>',
                    '<p>Gunakan rekening terpisah untuk usaha. Dengan begitu, Anda bisa mengetahui untung dan rugi dengan jelas, sekaligus lebih mudah ketika suatu saat mengajukan pinjaman modal ke lembaga keuangan.</p>',
                    '<h2>4. Urus legalitas usaha</h2>',
                    '<p>Pelaku usaha dapat mendaftarkan usahanya untuk memperoleh Nomor Induk Berusaha (NIB) melalui sistem Online Single Submission (OSS) di oss.go.id. Untuk usaha mikro dan kecil, prosesnya relatif sederhana dan dapat dilakukan secara daring. Legalitas membuka akses ke berbagai program pembinaan, pembiayaan, dan kerja sama dengan pihak lain. Untuk produk makanan dan minuman, pelajari juga ketentuan izin edar dan sertifikasi halal yang berlaku.</p>',
                    '<h2>5. Hadir di kanal digital</h2>',
                    '<p>Mulailah dari kanal yang paling dekat dengan pelanggan Anda:</p>',
                    '<ul><li><strong>Profil bisnis di Google Maps</strong> agar usaha mudah ditemukan orang di sekitar.</li><li><strong>Media sosial</strong> untuk menampilkan produk, testimoni, dan cerita di balik usaha Anda.</li><li><strong>Aplikasi pesan versi bisnis</strong> untuk katalog dan balasan otomatis.</li><li><strong>Lokapasar</strong> untuk menjangkau pembeli di luar kota.</li></ul>',
                    '<p>Foto produk yang jelas dan deskripsi yang jujur sangat menentukan. Tidak perlu kamera mahal, cukup cahaya alami dan latar yang bersih.</p>',
                    '<h2>6. Sediakan pembayaran nontunai</h2>',
                    '<p>QRIS memungkinkan satu kode QR menerima pembayaran dari berbagai aplikasi bank dan dompet digital. Selain praktis bagi pembeli, transaksi nontunai juga tercatat rapi sehingga memudahkan pembukuan.</p>',
                    '<h2>7. Rawat pelanggan</h2>',
                    '<p>Pelanggan yang puas adalah pemasar terbaik. Tanggapi pertanyaan dengan cepat, tangani keluhan dengan sopan, dan minta pelanggan memberikan ulasan. Pelanggan lama yang kembali membeli jauh lebih murah dipertahankan daripada mencari pelanggan baru.</p>',
                    '<p>Memulai usaha memang penuh tantangan, tetapi langkah kecil yang konsisten akan lebih bermakna daripada rencana besar yang tak kunjung dijalankan.</p>',
                ],
            ],
            [
                'title' => 'Bagaimana Undang-Undang Dibuat? Memahami Proses Legislasi di Indonesia',
                'category' => 'sosial-politik',
                'image' => 'photo-1529107386315-e1a2ed48a620',
                'excerpt' => 'Dari Prolegnas hingga pengundangan, berikut tahapan pembentukan undang-undang di Indonesia serta cara masyarakat ikut memberi masukan.',
                'tags' => ['Legislasi', 'DPR', 'Politik'],
                'body' => [
                    '<p>Hampir setiap pekan, pemberitaan diwarnai pembahasan rancangan undang-undang (RUU) di DPR. Namun, tidak semua orang memahami bagaimana sebuah RUU berubah menjadi undang-undang yang mengikat seluruh warga. Padahal, memahami prosesnya penting agar masyarakat bisa mengawasi dan ikut memberi masukan.</p>',
                    '<h2>Dasar hukumnya</h2>',
                    '<p>Kewenangan membentuk undang-undang diatur dalam Undang-Undang Dasar 1945, yang menyebutkan bahwa DPR memegang kekuasaan membentuk undang-undang dan setiap RUU dibahas bersama oleh DPR dan Presiden untuk mendapat persetujuan bersama. Tata caranya diatur lebih rinci dalam Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan beserta perubahannya.</p>',
                    '<h2>Tahap 1: Perencanaan</h2>',
                    '<p>RUU yang akan dibahas dimasukkan ke dalam Program Legislasi Nasional (Prolegnas), yaitu daftar rencana pembentukan undang-undang untuk jangka menengah dan tahunan. Prolegnas disusun bersama oleh DPR dan pemerintah. Dalam keadaan tertentu, RUU juga dapat diajukan di luar Prolegnas.</p>',
                    '<h2>Tahap 2: Penyusunan</h2>',
                    '<p>RUU dapat berasal dari DPR, Presiden, atau Dewan Perwakilan Daerah (DPD) untuk bidang tertentu yang berkaitan dengan daerah, seperti otonomi daerah serta pengelolaan sumber daya alam. RUU umumnya disertai naskah akademik yang memuat kajian mengapa aturan tersebut dibutuhkan.</p>',
                    '<h2>Tahap 3: Pembahasan</h2>',
                    '<p>Pembahasan dilakukan dalam dua tingkat. Pada pembicaraan tingkat I, RUU dibahas di komisi, gabungan komisi, badan legislasi, atau panitia khusus bersama wakil pemerintah. Di tahap ini dibahas daftar inventarisasi masalah dan digelar rapat dengar pendapat dengan para pihak. Pada pembicaraan tingkat II, hasil pembahasan dibawa ke rapat paripurna DPR untuk diambil keputusan.</p>',
                    '<h2>Tahap 4: Pengesahan</h2>',
                    '<p>RUU yang telah disetujui bersama oleh DPR dan Presiden kemudian disahkan oleh Presiden dengan membubuhkan tanda tangan. Jika dalam waktu 30 hari sejak disetujui bersama RUU tersebut belum ditandatangani Presiden, RUU itu tetap sah menjadi undang-undang dan wajib diundangkan.</p>',
                    '<h2>Tahap 5: Pengundangan</h2>',
                    '<p>Undang-undang diundangkan dalam Lembaran Negara Republik Indonesia agar diketahui dan mengikat seluruh masyarakat. Sejak saat itu, aturan tersebut berlaku sesuai ketentuan di dalamnya.</p>',
                    '<h2>Peran masyarakat</h2>',
                    '<p>Masyarakat berhak memberikan masukan secara lisan maupun tertulis dalam setiap tahap pembentukan undang-undang. Caranya bisa melalui rapat dengar pendapat umum, kunjungan kerja anggota DPR, seminar, atau kanal daring yang disediakan DPR dan kementerian. Naskah RUU dan naskah akademik semestinya dapat diakses publik agar masukan yang diberikan bermakna.</p>',
                    '<h2>Jika undang-undang dianggap bertentangan dengan konstitusi</h2>',
                    '<p>Warga negara yang merasa hak konstitusionalnya dirugikan oleh suatu undang-undang dapat mengajukan permohonan pengujian ke Mahkamah Konstitusi. Mekanisme ini menjadi salah satu bentuk kontrol agar setiap undang-undang tetap sejalan dengan UUD 1945.</p>',
                    '<p>Memahami proses legislasi membantu kita membaca berita politik dengan lebih jernih, sekaligus menyadari bahwa warga punya ruang untuk ikut menentukan aturan yang akan mengikat kehidupan bersama.</p>',
                ],
            ],
            [
                'title' => 'Cara Melaporkan Pelayanan Publik yang Buruk: Dari LAPOR! hingga Ombudsman',
                'category' => 'sosial-politik',
                'image' => 'photo-1450101499163-c8848c66ca85',
                'excerpt' => 'Pengurusan dokumen berbelit, pungutan liar, atau petugas yang tidak responsif bisa dilaporkan. Kenali kanal resmi pengaduan dan cara menyusun laporan yang kuat.',
                'tags' => ['PelayananPublik', 'Ombudsman', 'Sosial'],
                'body' => [
                    '<p>Hampir semua orang pernah mengalami pelayanan publik yang mengecewakan: antrean yang tidak jelas, dokumen yang tak kunjung selesai, permintaan uang di luar ketentuan, atau petugas yang sulit dihubungi. Banyak yang memilih diam karena merasa laporan tidak akan ditanggapi. Padahal, ada jalur resmi yang dapat ditempuh, dan setiap laporan membantu memperbaiki layanan bagi semua orang.</p>',
                    '<h2>Hak warga atas pelayanan publik</h2>',
                    '<p>Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik mengatur bahwa setiap penyelenggara layanan wajib memiliki standar pelayanan, termasuk persyaratan, prosedur, waktu penyelesaian, dan biaya. Standar ini seharusnya diumumkan secara terbuka. Masyarakat berhak mendapatkan layanan sesuai standar dan berhak mengadu bila layanan tidak sesuai.</p>',
                    '<h2>Langkah 1: Adukan ke unit layanan terkait</h2>',
                    '<p>Mulailah dengan menyampaikan keluhan langsung ke instansi penyelenggara, misalnya melalui unit pengaduan, kotak saran, nomor layanan, atau akun media sosial resminya. Banyak masalah dapat diselesaikan di tahap ini. Catat nama petugas, waktu, dan nomor tiket pengaduan jika ada.</p>',
                    '<h2>Langkah 2: Gunakan SP4N-LAPOR!</h2>',
                    '<p>Pemerintah menyediakan Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional, yang dikenal sebagai SP4N-LAPOR!, melalui situs lapor.go.id. Kanal ini terhubung dengan banyak kementerian, lembaga, dan pemerintah daerah. Laporan akan diteruskan ke instansi yang berwenang, dan pelapor dapat memantau perkembangan tindak lanjutnya. Identitas pelapor juga dapat dirahasiakan.</p>',
                    '<h2>Langkah 3: Laporkan ke Ombudsman Republik Indonesia</h2>',
                    '<p>Ombudsman RI adalah lembaga negara yang mengawasi penyelenggaraan pelayanan publik, sebagaimana diatur dalam Undang-Undang Nomor 37 Tahun 2008. Ombudsman menangani dugaan maladministrasi, antara lain penundaan berlarut, penyimpangan prosedur, penyalahgunaan wewenang, tidak memberikan pelayanan, hingga permintaan imbalan yang tidak sah. Laporan dapat disampaikan ke kantor pusat maupun kantor perwakilan Ombudsman di provinsi, termasuk secara daring.</p>',
                    '<p>Pada umumnya, pelapor diminta terlebih dahulu menyampaikan keberatan kepada instansi terkait sebelum melapor ke Ombudsman.</p>',
                    '<h2>Menyusun laporan yang kuat</h2>',
                    '<ul><li><strong>Kronologi yang jelas:</strong> kapan, di mana, layanan apa, dan apa yang terjadi.</li><li><strong>Bukti pendukung:</strong> tanda terima berkas, tangkapan layar, foto, rekaman, atau bukti pembayaran.</li><li><strong>Identitas instansi dan petugas</strong> bila diketahui.</li><li><strong>Harapan penyelesaian:</strong> misalnya dokumen segera diterbitkan atau pungutan dikembalikan.</li></ul>',
                    '<p>Sampaikan laporan secara faktual dan sopan. Hindari tuduhan tanpa bukti, terutama jika laporan juga diunggah ke media sosial, agar tidak menimbulkan persoalan hukum baru.</p>',
                    '<h2>Mengapa melapor itu penting</h2>',
                    '<p>Setiap laporan menjadi data bagi instansi dan pengawas untuk menemukan titik lemah layanan. Semakin banyak warga yang melapor melalui jalur resmi, semakin besar dorongan bagi penyelenggara untuk berbenah. Pelayanan publik yang baik bukan hadiah, melainkan hak setiap warga negara.</p>',
                ],
            ],
            [
                'title' => 'Etika Bermedia Sosial: Bijak Berpendapat tanpa Terjerat Masalah Hukum',
                'category' => 'sosial-politik',
                'image' => 'photo-1573164713714-d95e436ab8d6',
                'excerpt' => 'Kebebasan berpendapat di media sosial tetap memiliki batas. Kenali etika dan rambu hukum agar kritik tersampaikan tanpa merugikan diri sendiri dan orang lain.',
                'tags' => ['LiterasiDigital', 'MediaSosial', 'Sosial'],
                'body' => [
                    '<p>Media sosial memberi setiap orang panggung untuk bersuara. Kritik terhadap kebijakan, ulasan produk, hingga keluh kesah sehari-hari bisa dibaca ribuan orang hanya dalam hitungan menit. Namun, jangkauan yang luas juga berarti dampak yang besar, baik positif maupun negatif. Unggahan yang ditulis dalam keadaan emosi dapat berujung pada konflik, perundungan, bahkan proses hukum.</p>',
                    '<h2>Kebebasan berpendapat dan batasannya</h2>',
                    '<p>Konstitusi menjamin kebebasan menyatakan pendapat. Di saat yang sama, kebebasan itu dijalankan dengan menghormati hak dan nama baik orang lain. Di Indonesia, aktivitas di ruang digital diatur antara lain dalam Undang-Undang Informasi dan Transaksi Elektronik (UU ITE) beserta perubahannya. Sejumlah ketentuannya berkaitan dengan penyerangan kehormatan atau nama baik, penyebaran berita bohong yang menimbulkan keonaran, serta ujaran kebencian berdasarkan suku, agama, ras, dan antargolongan.</p>',
                    '<h2>Prinsip sebelum mengunggah</h2>',
                    '<p><strong>Saring sebelum sharing.</strong> Pastikan informasi berasal dari sumber yang kredibel. Periksa tanggal, cari pembanding dari media lain, dan waspadai judul yang provokatif. Menyebarkan informasi keliru, meskipun tanpa sengaja, tetap dapat merugikan orang lain.</p>',
                    '<p><strong>Kritik kebijakan, bukan menyerang pribadi.</strong> Kritik yang kuat berfokus pada fakta dan dampak kebijakan, bukan hinaan terhadap fisik, keluarga, atau latar belakang seseorang.</p>',
                    '<p><strong>Jaga data pribadi orang lain.</strong> Menyebarkan alamat, nomor telepon, atau foto pribadi seseorang tanpa izin, atau yang dikenal sebagai doxing, dapat membahayakan orang tersebut dan melanggar hukum.</p>',
                    '<p><strong>Hindari menulis saat emosi.</strong> Beri jeda sebelum mengunggah tanggapan terhadap hal yang membuat Anda marah. Jejak digital sulit dihapus sepenuhnya, bahkan setelah unggahan dihapus.</p>',
                    '<h2>Menyampaikan keluhan secara efektif</h2>',
                    '<p>Keluhan terhadap layanan atau produk sebaiknya disampaikan terlebih dahulu melalui kanal resmi perusahaan atau instansi. Jika perlu diunggah ke publik, ceritakan secara faktual: apa yang terjadi, kapan, dan apa yang Anda harapkan. Sertakan bukti yang relevan tanpa memuat data pribadi orang lain, dan hindari kata-kata kasar atau tuduhan yang tidak bisa dibuktikan.</p>',
                    '<h2>Menghadapi perbedaan pendapat</h2>',
                    '<p>Perdebatan di kolom komentar sering kali tidak mengubah pendapat siapa pun. Bila diskusi mulai tidak sehat, tidak ada salahnya berhenti. Gunakan fitur bisukan, blokir, atau laporkan untuk akun yang menyebarkan kebencian atau melakukan perundungan.</p>',
                    '<h2>Lindungi anak dan remaja</h2>',
                    '<p>Anak dan remaja perlu didampingi saat mulai aktif di media sosial, termasuk dalam memahami batas usia pengguna, pengaturan privasi, dan risiko berbagi informasi pribadi. Bekali mereka dengan pemahaman bahwa yang diunggah hari ini bisa terus terlihat bertahun-tahun kemudian.</p>',
                    '<p>Media sosial yang sehat dibangun oleh penggunanya. Berpendapat dengan data, menghormati orang lain, dan memeriksa informasi sebelum menyebarkannya adalah kontribusi kecil yang berdampak besar bagi ruang digital kita bersama.</p>',
                ],
            ],
        ];
    }
}
