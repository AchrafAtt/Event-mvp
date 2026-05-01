<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    /**
     * Liste de toutes les réservations avec filtres.
     */
    public function index(Request $request): Response
    {
        $reservations = Reservation::query()
            ->with(['user', 'evenement'])
            ->when($request->statut, fn ($q, $statut) => $q->where('statut', $statut))
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q->where('nom', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only('statut', 'search'),
        ]);
    }

    /**
     * Changer le statut d'une réservation.
     */
    public function changerStatut(Request $request, Reservation $reservation): RedirectResponse
    {
        $request->validate([
            'statut' => ['required', 'string', 'in:en_attente,confirmee,annulee'],
        ]);

        $reservation->update(['statut' => $request->statut]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Statut mis à jour.']);

        return to_route('admin.reservations.index');
    }
}
