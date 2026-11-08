<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                ->when($request->filled('status'), fn ($query) => $query->where('is_active', $request->string('status')->toString() === 'aktif'))
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
        $user->forceFill(['email_verified_at' => now()]);
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
}
