<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\GetSharedSiteData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(GetSharedSiteData $site): Response
    {
        Gate::authorize('manage', Setting::class);

        return Inertia::render('admin/settings/index', ['settings' => $site->settings()]);
    }

    public function update(SaveSettingsRequest $request): RedirectResponse
    {
        Gate::authorize('manage', Setting::class);

        foreach ($request->validated() as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value ?? '']);
        }

        Inertia::flash('success', 'Pengaturan situs disimpan.');

        return back();
    }
}
