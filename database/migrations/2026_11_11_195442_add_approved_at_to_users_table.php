<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * New sign-ups wait for an admin before they can use the account. Everyone who already
     * has an account keeps access, so existing rows are marked approved.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('approved_at')->nullable()->after('is_active');
        });

        DB::table('users')->update(['approved_at' => DB::raw('created_at')]);
        DB::table('users')->whereNull('approved_at')->update(['approved_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('approved_at');
        });
    }
};
