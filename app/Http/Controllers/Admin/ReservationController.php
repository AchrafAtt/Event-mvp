<?php

namespace App\Http\Controllers\Admin;

use App\Actions\IssueReservationTicketQr;
use App\Enums\StatutReservation;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
            ->when($request->filled('statut'), function ($query) use ($request): void {
                $statut = StatutReservation::tryFrom((string) $request->statut);
                if ($statut !== null) {
                    $query->where('statut', $statut);
                }
            })
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
     * Détails d'une réservation côté administration.
     */
    public function show(Request $request, Reservation $reservation): Response
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        $reservation->load(['user', 'evenement', 'personnalisation', 'paiements.recus']);

        app(IssueReservationTicketQr::class)->ensureIssuedIfConfirmed($reservation);
        $reservation->refresh();
        $reservation->load(['user', 'evenement', 'personnalisation', 'paiements.recus']);

        return Inertia::render('admin/reservations/show', [
            'reservation' => $reservation,
            'ticketQrUrl' => $reservation->ticketQrAbsoluteUrl(),
            'ticketVerifyUrl' => $reservation->ticketVerifyAbsoluteUrl(),
            'statutOptions' => $this->statutOptionsForInertia(),
        ]);
    }

    /**
     * Changer le statut d'une réservation.
     */
    public function changerStatut(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'statut' => ['required', Rule::enum(StatutReservation::class)],
        ]);

        $statut = StatutReservation::from($validated['statut']);
        $reservation->update(['statut' => $statut]);

        $message = 'Statut mis à jour.';
        $toastType = 'success';

        if ($statut === StatutReservation::Confirmee) {
            $issued = app(IssueReservationTicketQr::class)->handle($reservation->fresh());
            if (! $issued) {
                $toastType = 'warning';
                $message = 'Statut mis à jour, mais la génération du billet QR a échoué. Réessayez plus tard ou vérifiez le service QR.';
            }
        }

        Inertia::flash('toast', ['type' => $toastType, 'message' => $message]);

        return to_route('admin.reservations.index');
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statutOptionsForInertia(): array
    {
        return collect(StatutReservation::cases())
            ->map(fn (StatutReservation $s): array => [
                'value' => $s->value,
                'label' => $s->label(),
            ])
            ->values()
            ->all();
    }
}
