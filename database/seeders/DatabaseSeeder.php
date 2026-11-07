<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with the sample data of the prototype.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin Redaksi',
            'slug' => 'admin-redaksi',
            'email' => 'admin@beresinnews.id',
            'job_title' => 'Administrator',
        ]);
        $admin->forceFill(['role' => UserRole::Admin])->save();

        $this->call([
            SettingSeeder::class,
            NewsroomSeeder::class,
            PageSeeder::class,
        ]);
    }
}
