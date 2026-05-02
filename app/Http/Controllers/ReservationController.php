<?php

namespace App\Http\Controllers;

use App\Enums\TypeEvenement;
use App\Enums\TypeOffre;
use App\Models\CoordonneesBancaires;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    /**
     * Liste des réservations du client connecté.
     */
    public function index(Request $request): Response
    {
        $reservations = $request->user()
            ->reservations()
            ->with('evenement')
            ->latest()
            ->get();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
        ]);
    }

    /**
     * Formulaire de création (wizard étape 1).
     */
    public function create(): Response
    {
        return Inertia::render('reservations/create', [
            'eventTypes' => collect(TypeEvenement::cases())
                ->map(fn (TypeEvenement $type): array => [
                    'value' => $type->value,
                    'label' => $type->value,
                ])
                ->values(),
        ]);
    }

    /**
     * Formulaire des informations client (wizard étape 3).
     */
    public function clientInfo(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('reservations/client-info', [
            'clientDefaults' => [
                'nom' => $user->nom,
                'telephone' => $user->telephone,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Formulaire des details evenement (wizard etape 4).
     */
    public function eventDetails(Request $request): Response
    {
        return Inertia::render('reservations/event-details', [
            'eventDetailsDefaults' => [
                'adresse_event' => (string) $request->session()->get('reservation.adresse_event', ''),
                'ville' => (string) $request->session()->get('reservation.ville', 'Marrakech'),
                'horaire' => (string) $request->session()->get('reservation.horaire', '16:00'),
                'nombre_personnes' => (int) $request->session()->get('reservation.nombre_personnes', 20),
            ],
        ]);
    }

    /**
     * Formulaire de personnalisation (wizard etape 5).
     */
    public function personalisation(Request $request): Response
    {
        return Inertia::render('reservations/personalisation', [
            'personalisationDefaults' => [
                'couleurs' => $request->session()->get('reservation.couleurs', ['#F9C6C6']),
                'style_decoration' => (string) $request->session()->get('reservation.style_decoration', 'Elegant'),
                'accessoires' => $request->session()->get('reservation.accessoires', ['Decoration florale']),
                'personnes_supplementaires' => (int) $request->session()->get('reservation.personnes_supplementaires', 0),
            ],
        ]);
    }

    /**
     * Formulaire de l'offre et du prix (wizard etape 6).
     */
    public function offerPrice(): Response
    {
        return Inertia::render('reservations/offer-price', [
            'offerDefaults' => [
                'selected_offer' => TypeOffre::Standard->value,
                'pack_prices' => [
                    TypeOffre::Base->value => 1400,
                    TypeOffre::Standard->value => 2500,
                    TypeOffre::Premium->value => 4500,
                ],
                'advance_amount' => 200,
            ],
        ]);
    }

    /**
     * Paiement de l'avance (upload du reçu et soumission du wizard).
     */
    public function payment(): Response
    {
        return Inertia::render('reservations/payment', [
            'bankDetails' => CoordonneesBancaires::query()->first(),
            'advanceAmount' => 200,
            'packPrices' => [
                TypeOffre::Base->value => 1400,
                TypeOffre::Standard->value => 2500,
                TypeOffre::Premium->value => 4500,
            ],
            'pricePerExtraGuest' => 250,
            'whatsappUrl' => $this->whatsappContactUrl(),
        ]);
    }

    /**
     * Page de confirmation après enregistrement complet du wizard.
     */
    public function confirmation(Reservation $reservation): Response
    {
        $this->authorize('view', $reservation);

        $reservation->loadMissing(['evenement']);

        return Inertia::render('reservations/confirmation', [
            'reservation' => [
                'id' => $reservation->id,
                'reference' => $reservation->reference,
                'prix_total' => $reservation->prix_total,
                'avance' => $reservation->avance,
                'reste_a_payer' => $reservation->reste_a_payer,
                'type_offre' => $reservation->type_offre->value,
                'statut' => $reservation->statut,
                'date_reservation' => $reservation->date_reservation->format('Y-m-d'),
                'evenement_label' => $reservation->evenement?->type_evenement->value ?? '',
            ],
            'whatsappUrl' => $this->whatsappContactUrl(),
        ]);
    }

    /**
     * Persiste la réservation complète (wizard) en une seule transaction.
     */
    public function completeWizard(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recu' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'type_service' => ['required', 'string', 'max:255'],
            'type_offre' => ['required', Rule::enum(TypeOffre::class)],
            'date_reservation' => ['required', 'date'],
            'remarques' => ['nullable', 'string'],
            'client_nom' => ['required', 'string', 'max:255'],
            'client_telephone' => ['required', 'string', 'max:50'],
            'evenement.type_evenement' => ['required', Rule::enum(TypeEvenement::class)],
            'evenement.date' => ['required', 'date'],
            'evenement.horaire' => ['required', 'date_format:H:i'],
            'evenement.zone' => ['required', 'string', 'max:255'],
            'evenement.adresse_detaillee' => ['required', 'string'],
            'evenement.ville' => ['nullable', 'string', 'max:255'],
            'evenement.nombre_personnes' => ['required', 'integer', 'min:5'],
            'evenement.local_naissance' => ['nullable', 'string', 'max:255'],
            'evenement.nom_clinique' => ['nullable', 'string', 'max:255'],
            'evenement.theme_anniversaire' => ['nullable', 'string', 'max:255'],
            'evenement.type_ceremonie' => ['nullable', 'string', 'max:255'],
            'personnalisation.style_decoration' => ['required', 'string', 'max:255'],
            'personnalisation.couleurs' => ['nullable', 'array'],
            'personnalisation.couleurs.*' => ['nullable', 'string', 'max:64'],
            'personnalisation.accessoires' => ['nullable', 'array'],
            'personnalisation.accessoires.*' => ['nullable', 'string', 'max:255'],
            'personnalisation.texte_personnalise' => ['nullable', 'string'],
            'personnalisation.personnes_supplementaires' => ['required', 'integer', 'min:0', 'max:500'],
        ]);

        $typeOffre = TypeOffre::from($validated['type_offre']);
        $packBase = self::packBaseForTypeOffre($typeOffre);
        $personnesSupplementaires = (int) $validated['personnalisation']['personnes_supplementaires'];
        $extras = $personnesSupplementaires * 250;
        $prixTotal = $packBase + $extras;
        $avance = 200;
        $resteAPayer = $prixTotal - $avance;

        $reservation = DB::transaction(function () use ($request, $validated, $typeOffre, $packBase, $prixTotal, $avance, $resteAPayer, $personnesSupplementaires): Reservation {
            $user = $request->user();
            $user->update([
                'nom' => $validated['client_nom'],
                'telephone' => $validated['client_telephone'],
            ]);

            $reservation = $user->reservations()->create([
                'type_service' => $validated['type_service'],
                'type_offre' => $typeOffre,
                'date_reservation' => $validated['date_reservation'],
                'remarques' => $validated['remarques'] ?? null,
                'reference' => 'REF-'.strtoupper(uniqid()),
                'statut' => 'en_attente',
                'prix_total' => $prixTotal,
                'avance' => $avance,
                'reste_a_payer' => $resteAPayer,
            ]);

            $reservation->evenement()->create($validated['evenement']);

            $couleurs = array_values(array_filter(
                $validated['personnalisation']['couleurs'] ?? [],
                static fn (mixed $c): bool => is_string($c) && $c !== '',
            ));
            $accessoires = array_values(array_filter(
                $validated['personnalisation']['accessoires'] ?? [],
                static fn (mixed $a): bool => is_string($a) && $a !== '',
            ));

            $reservation->personnalisation()->create([
                'style_decoration' => $validated['personnalisation']['style_decoration'],
                'couleurs' => $couleurs,
                'accessoires' => $accessoires,
                'texte_personnalise' => $validated['personnalisation']['texte_personnalise'] ?? null,
                'remarques' => null,
                'tarif_fixe' => $packBase,
                'prix_par_personne' => 250,
                'nombre_personnes' => $validated['evenement']['nombre_personnes'],
                'personnes_supplementaires' => $personnesSupplementaires,
            ]);

            $paiement = $reservation->paiements()->create([
                'montant_avance' => $avance,
                'mode_paiement' => 'virement',
                'statut_paiement' => 'en_attente',
                'date_paiement' => now()->toDateString(),
            ]);

            $file = $request->file('recu');
            $path = $file->store('recus', 'local');

            $paiement->recus()->create([
                'nom_fichier' => $file->getClientOriginalName(),
                'type_fichier' => (string) $file->getMimeType(),
                'chemin_fichier' => $path,
                'date_import' => now(),
            ]);

            return $reservation;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Votre réservation a été enregistrée. Merci !']);

        return to_route('reservations.confirmation', $reservation);
    }

    /**
     * Enregistrement d'une nouvelle réservation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type_service' => ['required', 'string'],
            'type_offre' => ['required', Rule::enum(TypeOffre::class)],
            'date_reservation' => ['required', 'date'],
            'remarques' => ['nullable', 'string'],
            'evenement.type_evenement' => ['required', Rule::enum(TypeEvenement::class)],
            'evenement.date' => ['required', 'date'],
            'evenement.horaire' => ['required', 'date_format:H:i'],
            'evenement.zone' => ['required', 'string'],
            'evenement.adresse_detaillee' => ['required', 'string'],
            'evenement.nombre_personnes' => ['required', 'integer', 'min:1'],
            'evenement.local_naissance' => ['nullable', 'string'],
            'evenement.nom_clinique' => ['nullable', 'string'],
            'evenement.theme_anniversaire' => ['nullable', 'string'],
            'evenement.type_ceremonie' => ['nullable', 'string'],
        ]);

        $reservation = $request->user()->reservations()->create([
            ...$validated,
            'reference' => 'REF-'.strtoupper(uniqid()),
            'statut' => 'en_attente',
        ]);

        $reservation->evenement()->create($validated['evenement']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Réservation créée avec succès.']);

        return to_route('reservations.show', $reservation);
    }

    /**
     * Récapitulatif et statut d'une réservation.
     */
    public function show(Request $request, Reservation $reservation): Response
    {
        $this->authorize('view', $reservation);

        $reservation->load(['evenement', 'personnalisation', 'paiements.recus']);

        return Inertia::render('reservations/show', [
            'reservation' => $reservation,
        ]);
    }

    private static function packBaseForTypeOffre(TypeOffre $offre): int
    {
        return match ($offre) {
            TypeOffre::Base => 1400,
            TypeOffre::Standard => 2500,
            TypeOffre::Premium => 4500,
        };
    }

    private function whatsappContactUrl(): ?string
    {
        $raw = config('services.whatsapp_phone');
        if (! is_string($raw) || $raw === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $raw);
        if ($digits === '') {
            return null;
        }

        return 'https://wa.me/'.$digits;
    }
}
