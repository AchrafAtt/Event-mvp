<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can open offer and price step with defaults', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reservations.offer-price'));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/offer-price')
        ->where('offerDefaults.selected_offer', 'Standard')
        ->where('offerDefaults.pack_prices.Base', 1400)
        ->where('offerDefaults.pack_prices.Standard', 2500)
        ->where('offerDefaults.pack_prices.Premium', 4500)
        ->where('offerDefaults.advance_amount', 200)
    );
});
