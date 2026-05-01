<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        return Inertia::render('reservations/create');
    }

    /**
     * Enregistrement d'une nouvelle réservation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type_service' => ['required', 'string'],
            'type_offre' => ['required', 'string'],
            'date_reservation' => ['required', 'date'],
            'remarques' => ['nullable', 'string'],
            'evenement.type_evenement' => ['required', 'string'],
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
}
