<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    private const int PER_PAGE = 20;

    public function index(Request $request): Response
    {
        return Inertia::render('notifications/index', [
            'notifications' => $this->user($request)->notifications()
                ->paginate(self::PER_PAGE)
                ->through(fn (DatabaseNotification $notification): array => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? '',
                    'message' => $notification->data['message'] ?? '',
                    'is_read' => $notification->read_at !== null,
                    'created_label' => $notification->created_at?->diffForHumans(),
                ]),
        ]);
    }

    public function open(Request $request, string $notification): RedirectResponse
    {
        /** @var DatabaseNotification $record */
        $record = $this->user($request)->notifications()->findOrFail($notification);
        $record->markAsRead();

        return redirect()->to((string) ($record->data['url'] ?? route('notifications.index')));
    }

    public function readAll(Request $request): RedirectResponse
    {
        $this->user($request)->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }

    private function user(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
