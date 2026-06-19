<?php

use App\Models\User;

it('redirects guests from the home page to login', function () {
    $this->get('/')->assertRedirect(route('login', absolute: false));
});

it('redirects authenticated users from the home page to dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/')
        ->assertRedirect(route('dashboard', absolute: false));
});
