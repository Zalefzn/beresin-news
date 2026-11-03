<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table): void {
            $table->string('package', 20)->nullable()->index()->after('status');
            $table->text('rejection_reason')->nullable()->after('package');
        });

        Schema::create('article_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('package', 20);
            $table->unsignedInteger('amount');
            $table->string('status', 20)->default('pending')->index();
            $table->string('midtrans_order_id', 50)->unique();
            $table->string('payment_url')->nullable();
            $table->string('payment_type', 50)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['article_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_orders');

        Schema::table('articles', function (Blueprint $table): void {
            $table->dropIndex(['package']);
            $table->dropColumn(['package', 'rejection_reason']);
        });
    }
};
