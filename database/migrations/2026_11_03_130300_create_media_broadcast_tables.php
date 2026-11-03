<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('source_url');
            $table->string('thumbnail')->nullable();
            $table->string('duration', 10)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->index()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('live_streams', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('stream_url')->nullable();
            $table->boolean('is_live')->default(false)->index();
            $table->unsignedInteger('viewer_count')->default(0);
            $table->timestamps();
        });

        Schema::create('tv_programs', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('hosts')->nullable();
            $table->unsignedTinyInteger('day_of_week')->nullable()->index();
            $table->time('starts_at');
            $table->time('ends_at');
            $table->timestamps();
        });

        Schema::create('live_chat_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('live_stream_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('body', 200);
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();

            $table->index(['live_stream_id', 'is_hidden', 'created_at']);
        });

        Schema::create('breaking_news', function (Blueprint $table): void {
            $table->id();
            $table->string('text');
            $table->foreignId('article_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breaking_news');
        Schema::dropIfExists('live_chat_messages');
        Schema::dropIfExists('tv_programs');
        Schema::dropIfExists('live_streams');
        Schema::dropIfExists('videos');
    }
};
