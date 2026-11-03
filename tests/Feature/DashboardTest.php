<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('readers are sent to their submissions from the dashboard', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))->assertRedirect(route('submissions.index'));
});

test('newsroom staff are sent to the admin panel from the dashboard', function () {
    $this->actingAs(User::factory()->writer()->create());

    $this->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
});
