<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Actions\GetSharedSiteData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreContactMessageRequest;
use App\Mail\ContactMessageMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('contact/index');
    }

    public function store(StoreContactMessageRequest $request, GetSharedSiteData $site): RedirectResponse
    {
        /** @var array{email?: string} $contact */
        $contact = $site->setting('contact', []);

        /** @var array{name: string, email: string, subject: string, message: string} $data */
        $data = $request->validated();

        Mail::to($contact['email'] ?? config('mail.from.address'))->send(new ContactMessageMail(
            $data['name'],
            $data['email'],
            $data['subject'],
            $data['message'],
        ));

        Inertia::flash('success', 'Pesan Anda telah terkirim. Terima kasih!');

        return back();
    }
}
