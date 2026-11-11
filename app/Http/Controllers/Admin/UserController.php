<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveUserRequest;
use App\Models\ArticleOrder;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manage', User::class);

        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->when($request->filled('q'), function ($query) use ($request): void {
                    $term = '%'.$request->string('q')->toString().'%';
                    $query->where(fn ($inner) => $inner->whereLike('name', $term)->orWhereLike('email', $term));
                })
                ->when($request->filled('peran'), fn ($query) => $query->where('role', $request->string('peran')->toString()))
                ->when($request->filled('status'), function ($query) use ($request): void {
                    match ($request->string('status')->toString()) {
                        'menunggu' => $query->whereNull('approved_at')->where('role', UserRole::Reader)->where('is_active', true),
                        'aktif' => $query->where('is_active', true),
                        default => $query->where('is_active', false),
                    };
                })
                ->latest('created_at')
                ->latest('id')
                ->paginate(20)
                ->withQueryString()
                ->through(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'slug' => $user->slug,
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                    'avatar' => $user->avatar,
                    'job_title' => $user->job_title,
                    'bio' => $user->bio,
                    'is_active' => $user->is_active,
                    'is_pending' => $user->is_active && ! $user->isApproved(),
                    'is_new' => $user->created_at?->gte(now()->subDay()) ?? false,
                    'joined' => $user->created_at?->translatedFormat('j M Y, H:i'),
                    'joined_relative' => $user->created_at?->diffForHumans(),
                ]),
            'roles' => array_map(fn (UserRole $role): array => ['value' => $role->value, 'label' => $role->label()], UserRole::cases()),
            'filters' => $request->only(['q', 'peran', 'status']),
        ]);
    }

    public function store(SaveUserRequest $request): RedirectResponse
    {
        Gate::authorize('manage', User::class);

        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $user = new User(collect($data)->except('role')->all());
        $user->role = UserRole::from((string) $data['role']);
        $user->forceFill(['email_verified_at' => now(), 'approved_at' => now()]);
        $user->save();

        Inertia::flash('success', 'Pengguna berhasil ditambahkan.');

        return back();
    }

    public function update(SaveUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('manage', User::class);

        /** @var array<string, mixed> $data */
        $data = $request->validated();
        $isSelf = $user->is($request->user());

        if ($isSelf && (($data['role'] ?? null) !== UserRole::Admin->value || ! ($data['is_active'] ?? true))) {
            Inertia::flash('error', 'Anda tidak dapat menurunkan peran atau menonaktifkan akun sendiri.');

            return back();
        }

        $attributes = collect($data)->except('role');

        if (empty($data['password'])) {
            $attributes = $attributes->except('password');
        }

        $user->fill($attributes->all());
        $user->role = UserRole::from((string) $data['role']);
        $user->save();

        Inertia::flash('success', 'Pengguna berhasil diperbarui.');

        return back();
    }

    /**
     * Lets a self-registered reader into the dashboard and the paid news submission.
     */
    public function approve(User $user): RedirectResponse
    {
        Gate::authorize('manage', User::class);

        if ($user->isApproved()) {
            Inertia::flash('error', 'Akun ini sudah disetujui.');

            return back();
        }

        $user->forceFill(['approved_at' => now(), 'is_active' => true])->save();
        $user->notify(SubmissionNotification::accountApproved());

        Inertia::flash('success', "Akun {$user->name} disetujui.");

        return back();
    }

    /**
     * A rejected sign-up is deactivated, not deleted, so the same email cannot simply register again.
     */
    public function reject(User $user): RedirectResponse
    {
        Gate::authorize('manage', User::class);

        if ($user->isApproved()) {
            Inertia::flash('error', 'Akun yang sudah disetujui tidak bisa ditolak. Nonaktifkan bila perlu.');

            return back();
        }

        $user->update(['is_active' => false]);

        Inertia::flash('success', "Pendaftaran {$user->name} ditolak.");

        return back();
    }

    /**
     * Deactivates rather than deletes, so that authorship history stays intact.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('manage', User::class);

        if ($user->is($request->user())) {
            Inertia::flash('error', 'Anda tidak dapat menonaktifkan akun sendiri.');

            return back();
        }

        $user->update(['is_active' => false]);

        Inertia::flash('success', 'Pengguna dinonaktifkan.');

        return back();
    }

    /**
     * Permanently removes an account. Authors and anyone with a payment record are refused,
     * so published work and Midtrans history are never lost; those can only be deactivated.
     */
    public function forceDestroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('manage', User::class);

        if ($user->is($request->user())) {
            Inertia::flash('error', 'Anda tidak dapat menghapus akun sendiri.');

            return back();
        }

        if ($user->articles()->withTrashed()->exists() || ArticleOrder::query()->where('user_id', $user->id)->exists()) {
            Inertia::flash('error', "{$user->name} punya artikel atau riwayat pembayaran, jadi tidak bisa dihapus. Nonaktifkan saja.");

            return back();
        }

        DB::transaction(function () use ($user): void {
            $user->notifications()->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            $user->delete();
        });

        Inertia::flash('success', "Pengguna {$user->name} dihapus permanen.");

        return back();
    }
}
