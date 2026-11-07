<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Support\Facades\Notification;

/**
 * Sends a newsroom alert by email to the shared redaksi inbox, and to every active admin's
 * notification bell. Admins get no personal email, so each alert lands in one inbox only.
 */
class NotifyNewsroom
{
    public function handle(SubmissionNotification $notification): void
    {
        Notification::send(
            User::query()->where('role', 'admin')->where('is_active', true)->get(),
            $notification->withoutMail(),
        );

        $inbox = (string) config('services.newsroom.email');

        if ($inbox !== '') {
            Notification::route('mail', $inbox)->notify($notification);
        }
    }
}
