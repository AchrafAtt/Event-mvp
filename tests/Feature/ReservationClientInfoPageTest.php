<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can open client info step with auth defaults', function () {
    $user = User::factory()->create([
        'nom' => 'Sara Benali',
        'telephone' => '0612345678',
        'email' => 'sara@example.com',
    ]);

    $response = $this->actingAs($user)->get(route('reservations.client-info'));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/client-info')
        ->where('clientDefaults.nom', 'Sara Benali')
        ->where('clientDefaults.telephone', '0612345678')
        ->where('clientDefaults.email', 'sara@example.com')
    );
});
