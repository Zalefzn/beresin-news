<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterIssue;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manage', NewsletterSubscriber::class);

        return Inertia::render('admin/newsletter/index', [
            'subscribers' => NewsletterSubscriber::query()
                ->when($request->filled('q'), fn ($query) => $query->whereLike('email', '%'.$request->string('q')->toString().'%'))
                ->when($request->string('status')->toString() === 'aktif', fn ($query) => $query->active())
                ->when($request->string('status')->toString() === 'menunggu', fn ($query) => $query->whereNull('confirmed_at')->whereNull('unsubscribed_at'))
                ->when($request->string('status')->toString() === 'berhenti', fn ($query) => $query->whereNotNull('unsubscribed_at'))
                ->latest('id')
                ->paginate(30)
                ->withQueryString()
                ->through(fn (NewsletterSubscriber $subscriber): array => [
                    'id' => $subscriber->id,
                    'email' => $subscriber->email,
                    'status' => $this->statusLabel($subscriber),
                    'joined_label' => $subscriber->created_at?->translatedFormat('j M Y'),
                ]),
            'activeCount' => NewsletterSubscriber::query()->active()->count(),
            'filters' => $request->only(['q', 'status']),
        ]);
    }

    public function export(): StreamedResponse
    {
        Gate::authorize('manage', NewsletterSubscriber::class);

        return response()->streamDownload(function (): void {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                return;
            }

            fputcsv($output, ['email', 'status', 'terdaftar'], escape: '');

            NewsletterSubscriber::query()->orderBy('id')->chunk(500, function ($subscribers) use ($output): void {
                foreach ($subscribers as $subscriber) {
                    fputcsv($output, [
                        $this->neutralizeFormula($subscriber->email),
                        $this->statusLabel($subscriber),
                        $subscriber->created_at?->toDateTimeString(),
                    ], escape: '');
                }
            });

            fclose($output);
        }, 'pelanggan-newsletter.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function send(Request $request): RedirectResponse
    {
        Gate::authorize('manage', NewsletterSubscriber::class);

        /** @var array{subject: string, body: string} $data */
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:20000'],
        ], [], ['subject' => 'subjek', 'body' => 'isi buletin']);

        SendNewsletterIssue::dispatch($data['subject'], $data['body']);

        Inertia::flash('success', 'Buletin masuk antrean pengiriman.');

        return back();
    }

    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        Gate::authorize('manage', NewsletterSubscriber::class);

        $subscriber->delete();

        Inertia::flash('success', 'Pelanggan dihapus.');

        return back();
    }

    private function statusLabel(NewsletterSubscriber $subscriber): string
    {
        return match (true) {
            $subscriber->unsubscribed_at !== null => 'Berhenti',
            $subscriber->confirmed_at !== null => 'Terkonfirmasi',
            default => 'Menunggu konfirmasi',
        };
    }

    /**
     * Prevents spreadsheet applications from running a cell as a formula.
     */
    private function neutralizeFormula(string $value): string
    {
        return in_array(substr($value, 0, 1), ['=', '+', '-', '@'], true) ? "'{$value}" : $value;
    }
}
