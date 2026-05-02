<?php

use App\Enums\TypeEvenement;
use App\Enums\TypeOffre;
use App\Models\Evenement;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('authenticated users can view confirmation for their own reservation', function () {
    $user = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $user->id,
        'reference' => 'REF-TESTCONFIRM',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-07-01',
        'statut' => 'en_attente',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
    ]);

    Evenement::query()->create([
        'reservation_id' => $reservation->id,
        'type_evenement' => TypeEvenement::Anniversaire,
        'date' => '2026-07-01',
        'horaire' => '17:00',
        'zone' => 'Marrakech',
        'adresse_detaillee' => 'Adresse',
        'ville' => 'Marrakech',
        'nombre_personnes' => 20,
    ]);

    $response = $this->actingAs($user)->get(route('reservations.confirmation', $reservation));

    $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('reservations/confirmation')
        ->where('reservation.reference', 'REF-TESTCONFIRM')
        ->where('reservation.type_offre', 'Standard'));
});

test('users cannot view confirmation for another users reservation', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $owner->id,
        'reference' => 'REF-OTHER',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Base,
        'date_reservation' => '2026-07-01',
        'statut' => 'en_attente',
        'prix_total' => 1400,
        'avance' => 200,
        'reste_a_payer' => 1200,
        'remarques' => null,
    ]);

    $this->actingAs($other)->get(route('reservations.confirmation', $reservation))
        ->assertForbidden();
});
