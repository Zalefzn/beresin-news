<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

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

    /**
     * Messages go to the redaksi inbox, not the public contact email shown on the site.
     */
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        /** @var array{name: string, email: string, subject: string, message: string} $data */
        $data = $request->validated();

        Mail::to((string) config('services.newsroom.email'))->send(new ContactMessageMail(
            $data['name'],
            $data['email'],
            $data['subject'],
            $data['message'],
        ));

        Inertia::flash('success', 'Pesan Anda telah terkirim. Terima kasih!');

        return back();
    }
}
