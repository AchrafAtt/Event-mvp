<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can open event details step with defaults', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reservations.event-details'));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/event-details')
        ->where('eventDetailsDefaults.adresse_event', '')
        ->where('eventDetailsDefaults.ville', 'Marrakech')
        ->where('eventDetailsDefaults.horaire', '16:00')
        ->where('eventDetailsDefaults.nombre_personnes', 20)
    );
});
