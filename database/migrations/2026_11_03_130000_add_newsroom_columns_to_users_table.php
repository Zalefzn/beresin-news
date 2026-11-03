<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 20)->default('reader')->index()->after('password');
            $table->string('slug')->nullable()->unique()->after('name');
            $table->string('avatar')->nullable()->after('role');
            $table->string('job_title')->nullable()->after('avatar');
            $table->text('bio')->nullable()->after('job_title');
            $table->json('social')->nullable()->after('bio');
            $table->boolean('is_active')->default(true)->after('social');
            $table->timestamp('chat_blocked_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['role']);
            $table->dropUnique(['slug']);
            $table->dropColumn(['role', 'slug', 'avatar', 'job_title', 'bio', 'social', 'is_active', 'chat_blocked_at']);
        });
    }
};
