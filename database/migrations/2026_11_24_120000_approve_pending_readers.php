<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Sign-ups no longer wait for an admin, so readers still waiting are let in. Rejected
     * readers were deactivated and stay that way.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereNull('approved_at')
            ->where('is_active', true)
            ->update(['approved_at' => now()]);
    }

    public function down(): void
    {
        //
    }
};
