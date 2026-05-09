<?php

namespace App\Http\Controllers;

use App\Enums\StatutReservation;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tableau de bord admin (page dédiée /dashboard).
     */
    public function index(): Response
    {
        $stats = [
            'total_reservations' => Reservation::query()->count(),
            'reservations_en_attente' => Reservation::query()->where('statut', StatutReservation::EnAttente)->count(),
            'reservations_confirmees' => Reservation::query()->where('statut', StatutReservation::Confirmee)->count(),
            'reservations_annulees' => Reservation::query()->where('statut', StatutReservation::Annulee)->count(),
            'paiements_en_attente' => Paiement::query()->where('statut_paiement', 'en_attente')->count(),
            'total_clients' => User::query()->where('role', 'client')->count(),
            'revenus_total' => Paiement::query()->where('statut_paiement', 'confirme')->sum('montant_avance'),
        ];

        $recentReservations = Reservation::query()
            ->with(['user', 'evenement', 'paiements.recus'])
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn (Reservation $reservation): array => $this->mapReservationRow($reservation));

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentReservations' => $recentReservations,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapReservationRow(Reservation $reservation): array
    {
        $paiement = $reservation->paiements->sortByDesc('id')->first();
        $paymentBadge = 'unpaid';
        if ($paiement !== null) {
            $paymentBadge = match ($paiement->statut_paiement) {
                'confirme' => 'paid',
                'refuse' => 'unpaid',
                default => $paiement->recus->isNotEmpty() ? 'sent' : 'unpaid',
            };
        }

        $eventLabel = $reservation->evenement?->type_evenement->value ?? '—';

        return [
            'id' => $reservation->id,
            'reference' => $reservation->reference,
            'client_nom' => $reservation->user?->nom ?? '—',
            'event_label' => $eventLabel,
            'date_display' => $reservation->date_reservation->format('d/m/Y'),
            'prix_total' => (float) $reservation->prix_total,
            'prix_total_display' => number_format((float) $reservation->prix_total, 0, ',', ' ').' DH',
            'statut' => $reservation->statut->value,
            'payment_badge' => $paymentBadge,
        ];
    }
}
