<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('dateline', 100)->nullable();
            $table->string('excerpt', 300)->nullable();
            $table->longText('body');
            $table->string('cover_caption')->nullable();
            $table->string('cover_credit')->nullable();
            $table->foreignId('category_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('editor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_headline')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('is_breaking')->default(false);
            $table->unsignedSmallInteger('reading_time')->default(1);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->string('preview_token', 64)->unique();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'published_at']);
        });

        Schema::create('article_tag', function (Blueprint $table): void {
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['article_id', 'tag_id']);
        });

        Schema::create('article_views', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->string('session_hash', 64);
            $table->timestamp('viewed_at')->index();

            $table->index(['article_id', 'viewed_at']);
            $table->index(['article_id', 'session_hash', 'viewed_at']);
        });

        Schema::create('article_likes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_hash', 64)->nullable();
            $table->timestamps();

            $table->unique(['article_id', 'user_id']);
            $table->unique(['article_id', 'session_hash']);
        });

        Schema::create('bookmarks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'article_id']);
        });

        Schema::create('comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->string('name', 60);
            $table->string('email')->nullable();
            $table->text('body');
            $table->string('status', 20)->default('pending');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['article_id', 'status', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::dropIfExists('bookmarks');
        Schema::dropIfExists('article_likes');
        Schema::dropIfExists('article_views');
        Schema::dropIfExists('article_tag');
        Schema::dropIfExists('articles');
    }
};
