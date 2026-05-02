<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can open the payment step', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reservations.payment'));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/payment')
        ->where('advanceAmount', 200)
        ->where('pricePerExtraGuest', 250)
        ->where('packPrices.Base', 1400)
        ->where('packPrices.Standard', 2500)
        ->where('packPrices.Premium', 4500)
        ->has('bankDetails')
        ->has('whatsappUrl'));
});
