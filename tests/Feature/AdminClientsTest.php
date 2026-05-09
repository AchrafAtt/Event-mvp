<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting admin clients index', function () {
    $this->get(route('admin.clients.index'))
        ->assertRedirect(route('login'));
});

test('clients cannot view admin clients index', function () {
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)
        ->get(route('admin.clients.index'))
        ->assertForbidden();
});

test('clients cannot view admin client show', function () {
    $client = User::factory()->create(['role' => 'client']);
    $otherClient = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)
        ->get(route('admin.clients.show', $otherClient))
        ->assertForbidden();
});

test('admins can view admin clients index', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.clients.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/clients/index')
            ->has('clients')
            ->where('clients.current_page', 1)
            ->has('clients.data'));
});

test('admins can view admin client show for a client user', function () {
    $admin = User::factory()->admin()->create();
    $clientUser = User::factory()->create(['role' => 'client']);

    $this->actingAs($admin)
        ->get(route('admin.clients.show', $clientUser))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/clients/show')
            ->has('client')
            ->has('reservations')
            ->where('reservations.current_page', 1)
            ->has('reservations.data'));
});

test('admins get not found when viewing admin client show for an admin user', function () {
    $admin = User::factory()->admin()->create();
    $otherAdmin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.clients.show', $otherAdmin))
        ->assertNotFound();
});
