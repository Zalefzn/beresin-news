<?php

use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\ProductionSeeder;
use Illuminate\Support\Facades\Hash;

afterEach(function () {
    putenv('ADMIN_EMAIL');
    putenv('ADMIN_PASSWORD');
});

test('the production seeder creates only the starting data and one admin', function () {
    putenv('ADMIN_EMAIL=redaksi@beresinnews.test');
    putenv('ADMIN_PASSWORD=kata-sandi-panjang-sekali');

    $this->seed(ProductionSeeder::class);

    $admin = User::query()->sole();
    expect($admin->email)->toBe('redaksi@beresinnews.test')
        ->and($admin->role)->toBe(UserRole::Admin)
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and(Hash::check('kata-sandi-panjang-sekali', $admin->password))->toBeTrue()
        ->and(Category::query()->orderBy('sort_order')->pluck('slug')->all())->toBe(['teknologi', 'edukasi-pendidikan', 'ekonomi', 'sosial-politik'])
        ->and(Page::query()->count())->toBeGreaterThan(0)
        ->and(Article::query()->count())->toBe(0);
});

test('the production seeder refuses to run without a strong admin password', function () {
    putenv('ADMIN_EMAIL=redaksi@beresinnews.test');
    putenv('ADMIN_PASSWORD=pendek');

    $this->seed(ProductionSeeder::class);
})->throws(RuntimeException::class);

test('sample content can be added on top of production data without known passwords', function () {
    putenv('ADMIN_EMAIL=redaksi@beresinnews.test');
    putenv('ADMIN_PASSWORD=kata-sandi-panjang-sekali');
    Http::fake(['*' => Http::response('', 404)]);

    $this->seed(ProductionSeeder::class);
    $this->seed(NewsroomSeeder::class);

    expect(Category::query()->count())->toBe(4)
        ->and(Article::query()->count())->toBe(6)
        ->and(User::query()->where('role', '!=', UserRole::Admin)->get())
        ->each(fn ($user) => $user->password->not->toBeNull()
            ->and(Hash::check('password', $user->value->password))->toBeFalse());
});
