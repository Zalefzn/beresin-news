<?php

declare(strict_types=1);

use App\Models\User;

$managerPages = ['admin.breaking.index', 'admin.comments.index', 'admin.videos.index', 'admin.live.index'];
$adminPages = ['admin.categories.index', 'admin.tags.index', 'admin.newsletter.index', 'admin.pages.index', 'admin.users.index', 'admin.settings.edit'];
$everyStaffPage = ['admin.dashboard', 'admin.articles.index', 'admin.articles.create'];

test('guests and readers cannot enter the panel', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get(route('admin.dashboard'))->assertForbidden();
});

test('staff pages open for writers, editors and admins', function (string $routeName) {
    foreach ([User::factory()->writer(), User::factory()->editor(), User::factory()->admin()] as $factory) {
        $this->actingAs($factory->create())->get(route($routeName))->assertOk();
    }
})->with($everyStaffPage);

test('newsroom pages open for editors and admins, not writers', function (string $routeName) {
    $this->actingAs(User::factory()->writer()->create())->get(route($routeName))->assertForbidden();
    $this->actingAs(User::factory()->editor()->create())->get(route($routeName))->assertOk();
    $this->actingAs(User::factory()->admin()->create())->get(route($routeName))->assertOk();
})->with($managerPages);

test('site pages open for admins only', function (string $routeName) {
    $this->actingAs(User::factory()->writer()->create())->get(route($routeName))->assertForbidden();
    $this->actingAs(User::factory()->editor()->create())->get(route($routeName))->assertForbidden();
    $this->actingAs(User::factory()->admin()->create())->get(route($routeName))->assertOk();
})->with($adminPages);

test('deactivated accounts are signed out', function () {
    $user = User::factory()->create(['is_active' => false]);

    $this->actingAs($user)->get(route('home'))->assertRedirect(route('login'));
    $this->assertGuest();
});

test('registration cannot set a role', function () {
    $this->post(route('register.store'), [
        'name' => 'Penyusup',
        'email' => 'penyusup@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
    ]);

    expect(User::query()->where('email', 'penyusup@example.com')->firstOrFail()->role->value)->toBe('reader');
});
