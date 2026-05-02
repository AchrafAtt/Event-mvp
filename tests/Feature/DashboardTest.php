<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('clients are redirected away from the dashboard', function () {
    $user = User::factory()->create(['role' => 'client']);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('reservations.index'));
});

test('admins can visit the dashboard', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('stats')
        ->where('stats.total_reservations', 0)
        ->where('stats.reservations_en_attente', 0)
        ->where('stats.reservations_confirmees', 0)
        ->where('stats.reservations_annulees', 0)
        ->where('stats.paiements_en_attente', 0)
        ->has('recentReservations'));
});

test('admin legacy dashboard URL redirects to the unified dashboard', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('dashboard'));
});
