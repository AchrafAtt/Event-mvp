<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can open personalisation step with defaults', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reservations.personalisation'));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/personalisation')
        ->where('personalisationDefaults.couleurs.0', '#F9C6C6')
        ->where('personalisationDefaults.style_decoration', 'Elegant')
        ->where('personalisationDefaults.accessoires.0', 'Decoration florale')
        ->where('personalisationDefaults.personnes_supplementaires', 0)
    );
});
