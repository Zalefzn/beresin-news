<?php

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('production accepts any password of at least eight characters', function () {
    app()->detectEnvironment(fn () => 'production');

    expect(Validator::make(['password' => 'password'], ['password' => Password::defaults()])->passes())->toBeTrue();
});

test('passwords shorter than eight characters are rejected', function () {
    $this->post(route('register.store'), [
        'name' => 'Pembaca Pendek',
        'email' => 'pendek@example.com',
        'password' => 'pass',
        'password_confirmation' => 'pass',
    ])->assertSessionHasErrors('password');
});
