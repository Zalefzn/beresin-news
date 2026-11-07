<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Starting data for a live site: settings, static pages, the four categories and one admin.
 * It avoids factories because Faker is not installed in production.
 *
 * Run with: ADMIN_EMAIL=... ADMIN_PASSWORD=... php artisan db:seed --class=ProductionSeeder --force
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) env('ADMIN_EMAIL', '');
        $password = (string) env('ADMIN_PASSWORD', '');

        if ($email === '' || strlen($password) < 12) {
            throw new RuntimeException('Isi ADMIN_EMAIL dan ADMIN_PASSWORD (minimal 12 karakter) sebelum menjalankan seeder ini.');
        }

        $this->call([SettingSeeder::class, PageSeeder::class]);

        foreach (NewsroomSeeder::CATEGORIES as $order => [$name, $slug, $color, $description]) {
            Category::query()->updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'color' => $color,
                'description' => $description,
                'sort_order' => $order,
                'is_active' => true,
            ]);
        }

        $admin = User::query()->firstOrNew(['email' => $email]);
        $admin->fill([
            'name' => 'Admin Redaksi',
            'slug' => 'admin-redaksi',
            'password' => $password,
            'job_title' => 'Administrator',
            'is_active' => true,
        ]);
        $admin->forceFill([
            'role' => UserRole::Admin,
            'email_verified_at' => $admin->email_verified_at ?? now(),
            'remember_token' => Str::random(10),
        ])->save();
    }
}
