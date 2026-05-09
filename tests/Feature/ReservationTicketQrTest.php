<?php

use App\Enums\StatutReservation;
use App\Enums\TypeEvenement;
use App\Enums\TypeOffre;
use App\Models\Evenement;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('confirming a reservation issues a QR ticket via the microservice', function () {
    $this->withoutMiddleware(PreventRequestForgery::class);
    Storage::fake('local');

    $minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    Http::fake([
        'qr-ticket.test/*' => Http::response([
            'format' => 'png',
            'image_base64' => $minimalPngBase64,
        ], 200),
    ]);

    $admin = User::factory()->admin()->create();
    $client = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $client->id,
        'reference' => 'REF-QR-TICKET-001',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-08-01',
        'statut' => 'en_attente',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
    ]);

    $this->actingAs($admin)->patch(route('admin.reservations.statut', $reservation), [
        'statut' => 'confirmee',
    ])->assertRedirect(route('admin.reservations.index'));

    $reservation->refresh();

    expect($reservation->statut)->toBe(StatutReservation::Confirmee)
        ->and($reservation->ticket_token)->not->toBeNull()
        ->and($reservation->ticket_qr_path)->not->toBeNull()
        ->and($reservation->ticket_generated_at)->not->toBeNull();

    Storage::disk('local')->assertExists((string) $reservation->ticket_qr_path);
});

test('reservation owner can load ticket QR image', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $path = 'tickets/owner-qr-test.png';
    Storage::disk('local')->put($path, 'fake-png');

    $reservation = Reservation::query()->create([
        'user_id' => $user->id,
        'reference' => 'REF-QR-OWNER',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-08-02',
        'statut' => 'confirmee',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
        'ticket_token' => str_repeat('a', 48),
        'ticket_qr_path' => $path,
        'ticket_generated_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('reservations.ticket-qr', $reservation))
        ->assertOk();
});

test('non owner non admin cannot load ticket QR image', function () {
    Storage::fake('local');

    $owner = User::factory()->create();
    $other = User::factory()->create();
    $path = 'tickets/owner-qr.png';
    Storage::disk('local')->put($path, 'x');

    $reservation = Reservation::query()->create([
        'user_id' => $owner->id,
        'reference' => 'REF-QR-FORBIDDEN',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-08-03',
        'statut' => 'confirmee',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
        'ticket_token' => str_repeat('b', 48),
        'ticket_qr_path' => $path,
        'ticket_generated_at' => now(),
    ]);

    $this->actingAs($other)
        ->get(route('reservations.ticket-qr', $reservation))
        ->assertForbidden();
});

test('admin can load ticket QR image for a client reservation', function () {
    Storage::fake('local');

    $admin = User::factory()->admin()->create();
    $client = User::factory()->create();
    $path = 'tickets/admin-qr.png';
    Storage::disk('local')->put($path, 'png-bytes');

    $reservation = Reservation::query()->create([
        'user_id' => $client->id,
        'reference' => 'REF-QR-ADMIN',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-08-04',
        'statut' => 'confirmee',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
        'ticket_token' => str_repeat('c', 48),
        'ticket_qr_path' => $path,
        'ticket_generated_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('reservations.ticket-qr', $reservation))
        ->assertOk();
});

test('public ticket verification returns 404 for unknown token', function () {
    $this->get(route('tickets.show', ['token' => 'unknown-token-'.str_repeat('x', 40)]))
        ->assertNotFound();
});

test('public ticket verification page shows reservation details', function () {
    $user = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $user->id,
        'reference' => 'REF-PUBLIC-TICKET',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Premium,
        'date_reservation' => '2026-09-10',
        'statut' => 'confirmee',
        'prix_total' => 4500,
        'avance' => 500,
        'reste_a_payer' => 4000,
        'remarques' => null,
        'ticket_token' => str_repeat('d', 48),
        'ticket_qr_path' => null,
        'ticket_generated_at' => null,
    ]);

    Evenement::query()->create([
        'reservation_id' => $reservation->id,
        'type_evenement' => TypeEvenement::Anniversaire,
        'date' => '2026-09-12',
        'horaire' => '19:00',
        'zone' => 'Marrakech',
        'adresse_detaillee' => '1 Rue Test',
        'ville' => 'Marrakech',
        'nombre_personnes' => 40,
    ]);

    $this->get(route('tickets.show', ['token' => str_repeat('d', 48)]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/show')
            ->where('reference', 'REF-PUBLIC-TICKET')
            ->where('statut', 'confirmee')
            ->where('eventDate', '2026-09-12')
            ->where('eventType', 'Anniversaire'));
});

test('client reservation show generates QR when confirmed but PNG was never stored', function () {
    Storage::fake('local');

    $minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    Http::fake([
        'qr-ticket.test/*' => Http::response([
            'format' => 'png',
            'image_base64' => $minimalPngBase64,
        ], 200),
    ]);

    $client = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $client->id,
        'reference' => 'REF-LAZY-QR',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-09-01',
        'statut' => StatutReservation::Confirmee,
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
        'ticket_token' => null,
        'ticket_qr_path' => null,
        'ticket_generated_at' => null,
    ]);

    $response = $this->actingAs($client)->get(route('reservations.show', $reservation));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('reservations/show'));

    $ticketQrUrl = $response->inertiaProps('ticketQrUrl');
    expect($ticketQrUrl)->toBeString()->not->toBe('');

    $reservation->refresh();

    expect($reservation->ticket_token)->not->toBeNull()
        ->and($reservation->ticket_qr_path)->not->toBeNull();

    Storage::disk('local')->assertExists((string) $reservation->ticket_qr_path);
});

test('confirmed reservation still gets verify token when QR microservice URL is not configured', function () {
    config(['services.qr_ticket.url' => '']);
    Storage::fake('local');

    $client = User::factory()->create();

    $reservation = Reservation::query()->create([
        'user_id' => $client->id,
        'reference' => 'REF-NO-QR-SVC',
        'type_service' => 'Evenement',
        'type_offre' => TypeOffre::Standard,
        'date_reservation' => '2026-10-01',
        'statut' => StatutReservation::Confirmee,
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
        'ticket_token' => null,
        'ticket_qr_path' => null,
        'ticket_generated_at' => null,
    ]);

    $response = $this->actingAs($client)->get(route('reservations.show', $reservation));

    $response->assertOk();

    expect($response->inertiaProps('ticketQrUrl'))->toBeNull();
    expect($response->inertiaProps('ticketVerifyUrl'))->toBeString()->not->toBe('');

    $reservation->refresh();

    expect($reservation->ticket_token)->not->toBeNull()
        ->and($reservation->ticket_qr_path)->toBeNull();
});
