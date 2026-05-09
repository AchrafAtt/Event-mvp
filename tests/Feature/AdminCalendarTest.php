<?php

use App\Models\Reservation;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting admin calendar', function () {
    $this->get(route('admin.calendar'))
        ->assertRedirect(route('login'));
});

test('clients cannot view admin calendar', function () {
    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)
        ->get(route('admin.calendar'))
        ->assertForbidden();
});

test('admins see calendar events for reservations in the selected month', function () {
    $admin = User::factory()->admin()->create();
    $client = User::factory()->create(['nom' => 'Cal Client']);

    $reservation = Reservation::query()->create([
        'reference' => 'REF-CAL-001',
        'user_id' => $client->id,
        'type_service' => 'Evenement',
        'type_offre' => 'Standard',
        'date_reservation' => '2026-06-10',
        'statut' => 'en_attente',
        'prix_total' => 1000,
        'avance' => 0,
        'reste_a_payer' => 1000,
        'remarques' => null,
    ]);

    $reservation->evenement()->create([
        'type_evenement' => 'Anniversaire',
        'date' => '2026-06-15',
        'horaire' => '18:30',
        'zone' => 'Casablanca',
        'adresse_detaillee' => '1 Rue Test',
        'ville' => 'Casablanca',
        'nombre_personnes' => 20,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.calendar', ['year' => 2026, 'month' => 6]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/calendar/index')
            ->where('year', 2026)
            ->where('month', 6)
            ->has('events')
            ->where('events.0.reference', 'REF-CAL-001')
            ->where('events.0.event_date', '2026-06-15'));
});

test('admins see reservation without evenement using date_reservation in range', function () {
    $admin = User::factory()->admin()->create();
    $client = User::factory()->create();

    Reservation::query()->create([
        'reference' => 'REF-CAL-002',
        'user_id' => $client->id,
        'type_service' => 'Evenement',
        'type_offre' => 'Standard',
        'date_reservation' => '2026-07-08',
        'statut' => 'confirmee',
        'prix_total' => 2000,
        'avance' => 500,
        'reste_a_payer' => 1500,
        'remarques' => null,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.calendar', ['year' => 2026, 'month' => 7]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/calendar/index')
            ->has('events')
            ->where('events.0.reference', 'REF-CAL-002')
            ->where('events.0.event_date', '2026-07-08'));
});
