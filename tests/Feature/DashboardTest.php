<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('readers see their own dashboard', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.submissions', 0)
            ->where('stats.bookmarks', 0)
            ->has('recentSubmissions', 0)
            ->has('recentBookmarks', 0));
});

test('newsroom staff are sent to the admin panel from the dashboard', function () {
    $this->actingAs(User::factory()->writer()->create());

    $this->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
});

test('the admin dashboard shows the number of users', function () {
    User::factory()->count(2)->create();
    $this->actingAs(User::factory()->admin()->create());

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('stats.users', 3));
});

test('users can log out', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('logout'))->assertRedirect();

    $this->assertGuest();
});
