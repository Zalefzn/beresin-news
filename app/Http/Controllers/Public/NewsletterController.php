<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SubscribeNewsletterRequest;
use App\Mail\NewsletterConfirmationMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    /**
     * Always answers the same way, so the form does not reveal who is subscribed.
     */
    public function store(SubscribeNewsletterRequest $request): RedirectResponse
    {
        $subscriber = NewsletterSubscriber::query()->firstOrNew(['email' => $request->string('email')->lower()->toString()]);

        if (! $subscriber->exists || $subscriber->unsubscribed_at !== null || $subscriber->confirmed_at === null) {
            $subscriber->fill(['unsubscribed_at' => null, 'confirmed_at' => null])->save();
            Mail::to($subscriber->email)->send(new NewsletterConfirmationMail($subscriber));
        }

        Inertia::flash('success', 'Terima kasih! Silakan cek email Anda untuk konfirmasi.');

        return back();
    }

    public function confirm(string $token): Response
    {
        $subscriber = NewsletterSubscriber::query()->where('token', $token)->firstOrFail();

        if ($subscriber->confirmed_at === null) {
            $subscriber->update(['confirmed_at' => now(), 'unsubscribed_at' => null]);
        }

        return Inertia::render('newsletter/confirmed');
    }

    public function unsubscribe(string $token): Response
    {
        $subscriber = NewsletterSubscriber::query()->where('token', $token)->firstOrFail();

        if ($subscriber->unsubscribed_at === null) {
            $subscriber->update(['unsubscribed_at' => now()]);
        }

        return Inertia::render('newsletter/unsubscribed');
    }
}
