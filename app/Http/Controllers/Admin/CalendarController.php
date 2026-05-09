<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Calendrier des réservations (dates d'événement ou date de réservation).
     */
    public function index(Request $request): Response
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);

        if ($month < 1 || $month > 12) {
            $month = (int) now()->month;
        }

        if ($year < 1970 || $year > 2100) {
            $year = (int) now()->year;
        }

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $rangeStart = $start->toDateString();
        $rangeEnd = $end->toDateString();

        $reservations = Reservation::query()
            ->with(['user', 'evenement'])
            ->where(function ($query) use ($rangeStart, $rangeEnd) {
                $query->whereHas('evenement', function ($evenementQuery) use ($rangeStart, $rangeEnd) {
                    $evenementQuery->whereBetween('date', [$rangeStart, $rangeEnd]);
                })->orWhere(function ($fallback) use ($rangeStart, $rangeEnd) {
                    $fallback->whereDoesntHave('evenement')
                        ->whereBetween('date_reservation', [$rangeStart, $rangeEnd]);
                });
            })
            ->orderBy('date_reservation')
            ->get();

        $events = $reservations->map(function (Reservation $reservation): array {
            $evenement = $reservation->evenement;
            $eventDate = $evenement?->date?->format('Y-m-d')
                ?? $reservation->date_reservation->format('Y-m-d');

            $horaire = null;
            if ($evenement !== null && $evenement->horaire !== null) {
                $raw = $evenement->horaire;
                $horaire = is_string($raw)
                    ? substr($raw, 0, 5)
                    : $raw->format('H:i');
            }

            return [
                'id' => $reservation->id,
                'reference' => $reservation->reference,
                'statut' => $reservation->statut->value,
                'client_nom' => $reservation->user?->nom ?? '',
                'event_date' => $eventDate,
                'horaire' => $horaire,
                'event_type_label' => $evenement?->type_evenement?->value ?? '—',
            ];
        })->values()->all();

        return Inertia::render('admin/calendar/index', [
            'year' => $year,
            'month' => $month,
            'events' => $events,
        ]);
    }
}
