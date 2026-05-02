<?php

use App\Models\CoordonneesBancaires;
use App\Models\Paiement;
use App\Models\RecuPaiement;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('complete wizard persists reservation relations and receipt in one transaction', function () {
    $this->withoutMiddleware(PreventRequestForgery::class);
    Storage::fake('local');

    CoordonneesBancaires::query()->create([
        'banque' => 'CIH',
        'titulaire' => 'Ghozel Test',
        'rib' => '0000000000000000000000',
    ]);

    $user = User::factory()->create([
        'nom' => 'Old Name',
        'telephone' => '0600000000',
    ]);

    $file = UploadedFile::fake()->create('recu.pdf', 200, 'application/pdf');

    $payload = [
        'recu' => $file,
        'type_service' => 'Evenement',
        'type_offre' => 'Standard',
        'date_reservation' => '2026-06-15',
        'remarques' => 'Merci',
        'client_nom' => 'Client Neuf',
        'client_telephone' => '0611223344',
        'evenement' => [
            'type_evenement' => 'Anniversaire',
            'date' => '2026-06-15',
            'horaire' => '18:30',
            'zone' => 'Marrakech',
            'adresse_detaillee' => '123 Rue Atlas',
            'ville' => 'Marrakech',
            'nombre_personnes' => 30,
        ],
        'personnalisation' => [
            'style_decoration' => 'Elegant',
            'couleurs' => ['#F9C6C6', '#FFFFFF'],
            'accessoires' => ['Decoration florale'],
            'texte_personnalise' => 'Joyeux anniversaire',
            'personnes_supplementaires' => 2,
        ],
    ];

    $response = $this->actingAs($user)->post(route('reservations.complete-wizard'), $payload);

    $reservation = Reservation::query()->where('user_id', $user->id)->first();

    expect($reservation)->not->toBeNull();

    $response->assertRedirect(route('reservations.confirmation', $reservation));

    $user->refresh();
    expect($user->nom)->toBe('Client Neuf')
        ->and($user->telephone)->toBe('0611223344');

    expect((float) $reservation->prix_total)->toBe(3000.0)
        ->and((float) $reservation->avance)->toBe(200.0)
        ->and((float) $reservation->reste_a_payer)->toBe(2800.0)
        ->and($reservation->type_offre->value)->toBe('Standard');

    expect($reservation->evenement)->not->toBeNull()
        ->and($reservation->evenement->ville)->toBe('Marrakech')
        ->and($reservation->evenement->nombre_personnes)->toBe(30);

    expect($reservation->personnalisation)->not->toBeNull()
        ->and($reservation->personnalisation->personnes_supplementaires)->toBe(2)
        ->and($reservation->personnalisation->couleurs)->toBe(['#F9C6C6', '#FFFFFF']);

    /** @var Paiement $paiement */
    $paiement = $reservation->paiements()->first();
    expect($paiement)->not->toBeNull()
        ->and($paiement->mode_paiement)->toBe('virement')
        ->and($paiement->statut_paiement)->toBe('en_attente')
        ->and((float) $paiement->montant_avance)->toBe(200.0);

    $recu = RecuPaiement::query()->where('paiement_id', $paiement->id)->first();
    expect($recu)->not->toBeNull()
        ->and($recu->nom_fichier)->toBe('recu.pdf');

    Storage::disk('local')->assertExists($recu->chemin_fichier);
});
