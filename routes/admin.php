<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\BreakingNewsController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'approved', 'newsroom'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('artikel', [ArticleController::class, 'index'])->name('articles.index');
    Route::get('artikel/buat', [ArticleController::class, 'create'])->name('articles.create');
    Route::post('artikel', [ArticleController::class, 'store'])->name('articles.store');
    Route::post('artikel/unggah-gambar', [ArticleController::class, 'uploadImage'])->middleware('throttle:30,1')->name('articles.upload-image');
    Route::get('artikel/{article}/edit', [ArticleController::class, 'edit'])->name('articles.edit');
    Route::put('artikel/{article}', [ArticleController::class, 'update'])->name('articles.update');
    Route::put('artikel/{article}/autosave', [ArticleController::class, 'autosave'])->middleware('throttle:10,1')->name('articles.autosave');
    Route::delete('artikel/{article}', [ArticleController::class, 'destroy'])->name('articles.destroy');

    Route::get('tinjauan', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('tinjauan/{article}/setujui', [ReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('tinjauan/{article}/tolak', [ReviewController::class, 'reject'])->name('reviews.reject');
    Route::get('pesanan', [OrderController::class, 'index'])->name('orders.index');

    Route::get('kategori', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('kategori', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('kategori/urutan', [CategoryController::class, 'reorder'])->name('categories.reorder');
    Route::put('kategori/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('kategori/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('tag', [TagController::class, 'index'])->name('tags.index');
    Route::post('tag', [TagController::class, 'store'])->name('tags.store');
    Route::put('tag/{tag}', [TagController::class, 'update'])->name('tags.update');
    Route::delete('tag/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');

    Route::get('breaking', [BreakingNewsController::class, 'index'])->name('breaking.index');
    Route::post('breaking', [BreakingNewsController::class, 'store'])->name('breaking.store');
    Route::put('breaking/{breakingNews}', [BreakingNewsController::class, 'update'])->name('breaking.update');
    Route::delete('breaking/{breakingNews}', [BreakingNewsController::class, 'destroy'])->name('breaking.destroy');

    Route::get('komentar', [CommentController::class, 'index'])->name('comments.index');
    Route::post('komentar/massal', [CommentController::class, 'bulk'])->name('comments.bulk');
    Route::post('komentar/{comment}/balas', [CommentController::class, 'reply'])->name('comments.reply');
    Route::put('komentar/{comment}/status', [CommentController::class, 'updateStatus'])->name('comments.status');
    Route::delete('komentar/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    Route::get('newsletter', [NewsletterController::class, 'index'])->name('newsletter.index');
    Route::get('newsletter/ekspor', [NewsletterController::class, 'export'])->name('newsletter.export');
    Route::post('newsletter/kirim', [NewsletterController::class, 'send'])->name('newsletter.send');
    Route::delete('newsletter/{subscriber}', [NewsletterController::class, 'destroy'])->name('newsletter.destroy');

    Route::get('halaman', [PageController::class, 'index'])->name('pages.index');
    Route::get('halaman/buat', [PageController::class, 'create'])->name('pages.create');
    Route::post('halaman', [PageController::class, 'store'])->name('pages.store');
    Route::get('halaman/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
    Route::put('halaman/{page}', [PageController::class, 'update'])->name('pages.update');
    Route::delete('halaman/{page}', [PageController::class, 'destroy'])->name('pages.destroy');

    Route::get('pengguna', [UserController::class, 'index'])->name('users.index');
    Route::post('pengguna', [UserController::class, 'store'])->name('users.store');
    Route::put('pengguna/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('pengguna/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('pengguna/{user}/setujui', [UserController::class, 'approve'])->name('users.approve');
    Route::post('pengguna/{user}/tolak', [UserController::class, 'reject'])->name('users.reject');

    Route::get('pengaturan', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('pengaturan', [SettingController::class, 'update'])->name('settings.update');
});
