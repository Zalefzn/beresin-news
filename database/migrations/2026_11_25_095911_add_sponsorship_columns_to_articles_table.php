<?php

declare(strict_types=1);

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Admins now choose which stories run as ads. Paid stories already published keep running
     * for 30 days after they went live, as they did before.
     */
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table): void {
            $table->boolean('is_sponsored')->default(false)->after('is_breaking')->index();
            $table->timestamp('sponsored_until')->nullable()->after('is_sponsored');
        });

        DB::table('articles')
            ->whereNotNull('package')
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->orderBy('id')
            ->each(function (object $article): void {
                DB::table('articles')->where('id', $article->id)->update([
                    'is_sponsored' => true,
                    'sponsored_until' => CarbonImmutable::parse($article->published_at)->addDays(30),
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table): void {
            $table->dropIndex(['is_sponsored']);
            $table->dropColumn(['is_sponsored', 'sponsored_until']);
        });
    }
};
