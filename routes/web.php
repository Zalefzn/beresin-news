<?php

use App\Http\Controllers\Dashboard\NotificationController;
use App\Http\Controllers\Dashboard\SubmissionController;
use App\Http\Controllers\Public\ArticleController;
use App\Http\Controllers\Public\ArticleLikeController;
use App\Http\Controllers\Public\AuthorController;
use App\Http\Controllers\Public\BookmarkController;
use App\Http\Controllers\Public\CategoryController;
use App\Http\Controllers\Public\CommentController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\FeedController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\LiveChatController;
use App\Http\Controllers\Public\LiveController;
use App\Http\Controllers\Public\MidtransWebhookController;
use App\Http\Controllers\Public\NewsletterController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\TagController;
use App\Http\Controllers\Public\VideoController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('sitemap.xml', [FeedController::class, 'sitemap'])->name('feeds.sitemap');
Route::get('sitemap-news.xml', [FeedController::class, 'sitemapNews'])->name('feeds.sitemap-news');
Route::get('rss', [FeedController::class, 'rss'])->name('feeds.rss');
Route::get('rss/{category}', [FeedController::class, 'rssCategory'])->name('feeds.rss.category');
Route::get('robots.txt', [FeedController::class, 'robots'])->name('feeds.robots');

Route::get('cari', [SearchController::class, 'index'])->name('search.index');
Route::get('cari/saran', [SearchController::class, 'suggestions'])->middleware('throttle:60,1')->name('search.suggestions');
Route::get('indeks', [ArticleController::class, 'index'])->name('articles.index');
Route::get('terpopuler', [ArticleController::class, 'popular'])->name('articles.popular');
Route::permanentRedirect('kategori/teknologi-edukasi-pendidikan', '/kategori/teknologi');
Route::permanentRedirect('kategori/ekonomi-sosial-politik', '/kategori/ekonomi');
Route::permanentRedirect('kategori/ai-masa-depan', '/kategori/teknologi');
Route::permanentRedirect('kategori/gadget', '/kategori/teknologi');
Route::permanentRedirect('kategori/nasional', '/kategori/sosial-politik');
Route::get('kategori/{slug}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('tag/{slug}', [TagController::class, 'show'])->name('tags.show');
Route::get('penulis/{slug}', [AuthorController::class, 'show'])->name('authors.show');
Route::get('halaman/{slug}', [PageController::class, 'show'])->name('pages.show');

Route::get('live', [LiveController::class, 'index'])->name('live.index');
Route::post('live/{stream}/hadir', [LiveController::class, 'heartbeat'])->middleware('throttle:10,1')->name('live.heartbeat');
Route::post('live/{stream}/chat', [LiveChatController::class, 'store'])->middleware(['auth', 'throttle:live-chat'])->name('live.chat.store');

Route::get('video', [VideoController::class, 'index'])->name('videos.index');
Route::get('video/{slug}', [VideoController::class, 'show'])->name('videos.show');

Route::get('tersimpan', [BookmarkController::class, 'index'])->name('bookmarks.index');
Route::get('tersimpan/ringkasan', [BookmarkController::class, 'summary'])->middleware('throttle:60,1')->name('bookmarks.summary');

Route::middleware('auth')->group(function () {
    Route::post('tersimpan/sinkron', [BookmarkController::class, 'sync'])->name('bookmarks.sync');
    Route::delete('tersimpan', [BookmarkController::class, 'clear'])->name('bookmarks.clear');
    Route::post('artikel/{article}/simpan', [BookmarkController::class, 'toggle'])->name('bookmarks.toggle');
    Route::get('preview/{token}', [ArticleController::class, 'preview'])->name('articles.preview');
});

Route::post('artikel/{article}/suka', [ArticleLikeController::class, 'store'])->middleware('throttle:likes')->name('articles.like');
Route::post('artikel/{article}/komentar', [CommentController::class, 'store'])->middleware('throttle:comments')->name('comments.store');

Route::post('newsletter', [NewsletterController::class, 'store'])->middleware('throttle:newsletter')->name('newsletter.store');
Route::get('newsletter/konfirmasi/{token}', [NewsletterController::class, 'confirm'])->name('newsletter.confirm');
Route::get('newsletter/berhenti/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');

Route::get('kontak', [ContactController::class, 'show'])->name('contact.show');
Route::post('kontak', [ContactController::class, 'store'])->middleware('throttle:contact')->name('contact.store');

Route::post('midtrans/notifikasi', MidtransWebhookController::class)->middleware('throttle:120,1')->name('midtrans.notification');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return request()->user()?->canAccessNewsroom()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('submissions.index');
    })->name('dashboard');

    Route::get('kirim-berita', [SubmissionController::class, 'index'])->name('submissions.index');
    Route::get('kirim-berita/buat', [SubmissionController::class, 'create'])->name('submissions.create');
    Route::post('kirim-berita', [SubmissionController::class, 'store'])->middleware('throttle:20,1')->name('submissions.store');
    Route::post('kirim-berita/unggah-gambar', [SubmissionController::class, 'uploadImage'])->middleware('throttle:30,1')->name('submissions.upload-image');
    Route::get('kirim-berita/{article}/edit', [SubmissionController::class, 'edit'])->name('submissions.edit');
    Route::put('kirim-berita/{article}', [SubmissionController::class, 'update'])->name('submissions.update');
    Route::delete('kirim-berita/{article}', [SubmissionController::class, 'destroy'])->name('submissions.destroy');
    Route::post('kirim-berita/{article}/bayar', [SubmissionController::class, 'pay'])->middleware('throttle:20,1')->name('submissions.pay');
    Route::get('kirim-berita/{article}/pembayaran-selesai', [SubmissionController::class, 'finish'])->name('submissions.finish');
    Route::post('kirim-berita/{article}/ajukan-ulang', [SubmissionController::class, 'resubmit'])->name('submissions.resubmit');
});

Route::middleware('auth')->group(function () {
    Route::get('notifikasi', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifikasi/baca-semua', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::get('notifikasi/{notification}/buka', [NotificationController::class, 'open'])->name('notifications.open');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';

// Must stay last: two-segment catch-all for canonical article URLs.
Route::get('{category}/{article}', [ArticleController::class, 'show'])
    ->where(['category' => '[a-z0-9-]+', 'article' => '[a-z0-9-]+'])
    ->name('articles.show');
