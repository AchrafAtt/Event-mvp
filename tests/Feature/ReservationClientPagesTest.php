<?php

use App\Enums\TypeEvenement;
use App\Enums\TypeOffre;
use App\Models\Evenement;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('guests are redirected to login when visiting client reservations index', function () {
    $this->get(route('reservations.index'))
        ->assertRedirect(route('login'));
});

test('clients can view their reservations index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('reservations.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reservations/index')
            ->has('reservations', 0));
});

test('reservations index only lists the authenticated clients reservations', function () {
    $clientA = User::factory()->create();
    $clientB = User::factory()->create();

    $rA1 = Reservation::query()->create([
        'user_id' => $clientA->id,
        'reference' => 'REF-CLIENT-A-1',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-07-01',
        'statut' => 'en_attente',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
    ]);

    Reservation::query()->create([
        'user_id' => $clientA->id,
        'reference' => 'REF-CLIENT-A-2',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Base,
        'date_reservation' => '2026-07-02',
        'statut' => 'en_attente',
        'prix_total' => 1400,
        'avance' => 200,
        'reste_a_payer' => 1200,
        'remarques' => null,
    ]);

    Reservation::query()->create([
        'user_id' => $clientB->id,
        'reference' => 'REF-CLIENT-B-1',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Premium,
        'date_reservation' => '2026-08-01',
        'statut' => 'en_attente',
        'prix_total' => 4500,
        'avance' => 200,
        'reste_a_payer' => 4300,
        'remarques' => null,
    ]);

    Evenement::query()->create([
        'reservation_id' => $rA1->id,
        'type_evenement' => TypeEvenement::Anniversaire,
        'date' => '2026-07-01',
        'horaire' => '17:00',
        'zone' => 'Marrakech',
        'adresse_detaillee' => 'Adresse',
        'ville' => 'Marrakech',
        'nombre_personnes' => 20,
    ]);

    $response = $this->actingAs($clientA)->get(route('reservations.index'));

    $response->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reservations/index')
            ->has('reservations', 2));

    $refs = collect($response->inertiaProps('reservations'))
        ->pluck('reference')
        ->sort()
        ->values()
        ->all();

    expect($refs)->toBe(['REF-CLIENT-A-1', 'REF-CLIENT-A-2']);
});

test('clients can view their own reservation show page', function () {
    $user = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $user->id,
        'reference' => 'REF-CLIENT-SHOW',
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

    $this->actingAs($user)->get(route('reservations.show', $reservation))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reservations/show')
            ->where('reservation.reference', 'REF-CLIENT-SHOW')
            ->where('ticketQrUrl', null)
            ->where('ticketVerifyUrl', null)
            ->has('whatsappUrl'));
});

test('clients cannot view another users reservation show page', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $owner->id,
        'reference' => 'REF-PRIVATE',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Base,
        'date_reservation' => '2026-07-01',
        'statut' => 'en_attente',
        'prix_total' => 1400,
        'avance' => 200,
        'reste_a_payer' => 1200,
        'remarques' => null,
    ]);

    $this->actingAs($other)->get(route('reservations.show', $reservation))
        ->assertForbidden();
});
