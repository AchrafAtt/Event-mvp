<?php

use App\Enums\StatutReservation;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting admin reservation details', function () {
    $client = User::factory()->create();
    $reservation = Reservation::query()->create([
        'reference' => 'REF-ADMIN-DETAIL-001',
        'user_id' => $client->id,
        'type_service' => 'Evenement',
        'type_offre' => 'Standard',
        'date_reservation' => '2026-09-15',
        'statut' => 'en_attente',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => 'Aucune',
    ]);

    $this->get(route('admin.reservations.show', $reservation))
        ->assertRedirect(route('login'));
});

test('clients cannot view admin reservation details', function () {
    $client = User::factory()->create();
    $reservation = Reservation::query()->create([
        'reference' => 'REF-ADMIN-DETAIL-002',
        'user_id' => $client->id,
        'type_service' => 'Evenement',
        'type_offre' => 'Standard',
        'date_reservation' => '2026-09-16',
        'statut' => 'en_attente',
        'prix_total' => 2600,
        'avance' => 200,
        'reste_a_payer' => 2400,
        'remarques' => 'Client access test',
    ]);

    $this->actingAs($client)
        ->get(route('admin.reservations.show', $reservation))
        ->assertForbidden();
});

test('admins can view reservation details with linked data', function () {
    $admin = User::factory()->admin()->create();
    $client = User::factory()->create([
        'nom' => 'Client Admin Detail',
        'email' => 'client-admin-detail@example.com',
        'telephone' => '0611223344',
    ]);

    $reservation = Reservation::query()->create([
        'reference' => 'REF-ADMIN-DETAIL-003',
        'user_id' => $client->id,
        'type_service' => 'Evenement',
        'type_offre' => 'Premium',
        'date_reservation' => '2026-09-20',
        'statut' => 'confirmee',
        'prix_total' => 5000,
        'avance' => 1200,
        'reste_a_payer' => 3800,
        'remarques' => 'Prévoir installation la veille',
    ]);

    $reservation->evenement()->create([
        'type_evenement' => 'Anniversaire',
        'date' => '2026-09-20',
        'horaire' => '20:00',
        'zone' => 'Marrakech',
        'adresse_detaillee' => '123 Rue Atlas',
        'ville' => 'Marrakech',
        'nombre_personnes' => 80,
        'theme_anniversaire' => 'Rose Gold',
    ]);

    $reservation->personnalisation()->create([
        'style_decoration' => 'Elegant',
        'texte_personnalise' => 'Happy Birthday Sara',
        'remarques' => 'Ballons premium',
        'tarif_fixe' => 500,
        'prix_par_personne' => 30,
        'nombre_personnes' => 80,
    ]);

    /** @var Paiement $paiement */
    $paiement = $reservation->paiements()->create([
        'montant_avance' => 1200,
        'mode_paiement' => 'virement',
        'statut_paiement' => 'confirme',
        'date_paiement' => '2026-09-10',
    ]);

    $paiement->recus()->create([
        'nom_fichier' => 'recu-admin-detail.pdf',
        'type_fichier' => 'application/pdf',
        'chemin_fichier' => 'recus/recu-admin-detail.pdf',
        'date_import' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.reservations.show', $reservation))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reservations/show')
            ->where('reservation.reference', 'REF-ADMIN-DETAIL-003')
            ->where('reservation.user.nom', 'Client Admin Detail')
            ->where('reservation.evenement.zone', 'Marrakech')
            ->where('reservation.personnalisation.style_decoration', 'Elegant')
            ->where('reservation.paiements.0.recus.0.nom_fichier', 'recu-admin-detail.pdf')
            ->where('ticketVerifyUrl', fn (mixed $url) => is_string($url) && str_contains($url, '/tickets/'))
            ->where('ticketQrUrl', fn (mixed $url) => $url === null || is_string($url))
            ->has('statutOptions', 3)
            ->where('statutOptions.0.value', 'en_attente')
            ->where('statutOptions.1.value', 'confirmee')
            ->where('statutOptions.2.value', 'annulee'));
});

test('admin can change reservation statut via statut route', function () {
    $this->withoutMiddleware(PreventRequestForgery::class);

    $admin = User::factory()->admin()->create();
    $client = User::factory()->create();

    $reservation = Reservation::query()->create([
        'reference' => 'REF-ADMIN-STATUT-PATCH',
        'user_id' => $client->id,
        'type_service' => 'Evenement',
        'type_offre' => 'Standard',
        'date_reservation' => '2026-10-01',
        'statut' => 'en_attente',
        'prix_total' => 2500,
        'avance' => 200,
        'reste_a_payer' => 2300,
        'remarques' => null,
    ]);

    $this->actingAs($admin)->patch(route('admin.reservations.statut', $reservation), [
        'statut' => 'annulee',
    ])->assertRedirect(route('admin.reservations.index'));

    expect($reservation->fresh()->statut)->toBe(StatutReservation::Annulee);
});
