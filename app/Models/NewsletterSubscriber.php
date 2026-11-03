<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\NewsletterSubscriberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $email
 * @property string $token
 * @property Carbon|null $confirmed_at
 * @property Carbon|null $unsubscribed_at
 * @property Carbon|null $created_at
 */
#[Fillable(['email', 'token', 'confirmed_at', 'unsubscribed_at'])]
class NewsletterSubscriber extends Model
{
    /** @use HasFactory<NewsletterSubscriberFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (NewsletterSubscriber $subscriber): void {
            $subscriber->token ??= Str::random(48);
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['confirmed_at' => 'datetime', 'unsubscribed_at' => 'datetime'];
    }

    /**
     * @param  Builder<NewsletterSubscriber>  $query
     * @return Builder<NewsletterSubscriber>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotNull('confirmed_at')->whereNull('unsubscribed_at');
    }
}
