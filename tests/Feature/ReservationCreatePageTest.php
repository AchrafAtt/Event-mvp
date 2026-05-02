<?php

use App\Enums\TypeEvenement;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can open reservation create page with enum event types', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reservations.create'));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/create')
        ->has('eventTypes', count(TypeEvenement::cases()))
        ->where('eventTypes.0.value', TypeEvenement::Naissance->value)
        ->where('eventTypes.1.value', TypeEvenement::Fiancailles->value)
        ->where('eventTypes.2.value', TypeEvenement::ActeDeMariage->value)
        ->where('eventTypes.3.value', TypeEvenement::FeteHenna->value)
        ->where('eventTypes.4.value', TypeEvenement::Anniversaire->value)
    );
});
