<?php

namespace App\Services;

use App\Enums\StatutReservation;
use App\Models\Evenement;
use App\Models\Paiement;
use App\Models\Reservation;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Serializable snapshot for the analytics microservice (v1 metrics).
 *
 * @return array{
 *     meta: array{
 *         range_start: string,
 *         range_end: string,
 *         currency_label: string,
 *         revenue_note: string,
 *         reservations_note: string,
 *         capacity_note: string,
 *     },
 *     revenue_by_month: list<array{period: string, amount: float}>,
 *     reservations_by_month: list<array{period: string, en_attente: int, confirmee: int, annulee: int}>,
 *     capacity_projection: list<array{event_date: string, reservation_count: int, guests: int}>,
 * }
 */
class ReportingSnapshot
{
    /**
     * Build JSON-safe analytics payload for the given inclusive date range.
     */
    public function build(CarbonInterface $rangeStart, CarbonInterface $rangeEnd): array
    {
        $start = $rangeStart->copy()->startOfDay();
        $end = $rangeEnd->copy()->endOfDay();

        return [
            'meta' => [
                'range_start' => $start->toDateString(),
                'range_end' => $end->toDateString(),
                'currency_label' => 'DH',
                'revenue_note' => 'Somme des avances dont le paiement est validé (confirme), groupée par mois de date de paiement.',
                'reservations_note' => 'Nombre de réservations créées, par mois de date de réservation et par statut.',
                'capacity_note' => 'Projection capacité : réservations confirmées uniquement, regroupées par date d\'événement (pas une présence réelle à l\'entrée).',
            ],
            'revenue_by_month' => $this->revenueByMonth($start, $end),
            'reservations_by_month' => $this->reservationsByMonth($start, $end),
            'capacity_projection' => $this->capacityProjection($start, $end),
        ];
    }

    /**
     * @return list<array{period: string, amount: float}>
     */
    private function revenueByMonth(CarbonInterface $start, CarbonInterface $end): array
    {
        $driver = DB::connection()->getDriverName();
        $monthExpr = match ($driver) {
            'pgsql' => "to_char(date_paiement::date, 'YYYY-MM')",
            'mysql' => "DATE_FORMAT(date_paiement, '%Y-%m')",
            default => "strftime('%Y-%m', date_paiement)",
        };
        $sumExpr = match ($driver) {
            'pgsql', 'mysql' => 'SUM(CAST(montant_avance AS DECIMAL(14,2)))',
            default => 'SUM(CAST(montant_avance AS REAL))',
        };

        $rows = Paiement::query()
            ->where('statut_paiement', 'confirme')
            ->whereBetween('date_paiement', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("{$monthExpr} as period")
            ->selectRaw("{$sumExpr} as amount")
            ->groupBy(DB::raw($monthExpr))
            ->orderBy('period')
            ->get();

        return $rows->map(fn ($row): array => [
            'period' => (string) $row->period,
            'amount' => round((float) $row->amount, 2),
        ])->values()->all();
    }

    /**
     * SQLite uses strftime; for cross-DB we'd use DB::connection()->getDriverName() — app uses sqlite in dev/tests.
     *
     * @return list<array{period: string, en_attente: int, confirmee: int, annulee: int}>
     */
    private function reservationsByMonth(CarbonInterface $start, CarbonInterface $end): array
    {
        $driver = DB::connection()->getDriverName();
        $monthExpr = match ($driver) {
            'pgsql' => "to_char(date_reservation::date, 'YYYY-MM')",
            'mysql' => "DATE_FORMAT(date_reservation, '%Y-%m')",
            default => "strftime('%Y-%m', date_reservation)",
        };

        $aggregated = Reservation::query()
            ->whereBetween('date_reservation', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("{$monthExpr} as period")
            ->selectRaw('SUM(CASE WHEN statut = ? THEN 1 ELSE 0 END) as en_attente', [StatutReservation::EnAttente->value])
            ->selectRaw('SUM(CASE WHEN statut = ? THEN 1 ELSE 0 END) as confirmee', [StatutReservation::Confirmee->value])
            ->selectRaw('SUM(CASE WHEN statut = ? THEN 1 ELSE 0 END) as annulee', [StatutReservation::Annulee->value])
            ->groupBy(DB::raw($monthExpr))
            ->orderBy('period')
            ->get();

        return $aggregated->map(fn ($row): array => [
            'period' => (string) $row->period,
            'en_attente' => (int) $row->en_attente,
            'confirmee' => (int) $row->confirmee,
            'annulee' => (int) $row->annulee,
        ])->values()->all();
    }

    /**
     * @return list<array{event_date: string, reservation_count: int, guests: int}>
     */
    private function capacityProjection(CarbonInterface $start, CarbonInterface $end): array
    {
        return Evenement::query()
            ->join('reservations', 'evenements.reservation_id', '=', 'reservations.id')
            ->where('reservations.statut', StatutReservation::Confirmee)
            ->whereBetween('evenements.date', [$start->toDateString(), $end->toDateString()])
            ->select([
                'evenements.date',
            ])
            ->selectRaw('COUNT(*) as reservation_count')
            ->selectRaw('COALESCE(SUM(evenements.nombre_personnes), 0) as guests')
            ->groupBy('evenements.date')
            ->orderBy('evenements.date')
            ->get()
            ->map(function ($row): array {
                $date = $row->date;
                if ($date instanceof CarbonInterface) {
                    $eventDate = $date->toDateString();
                } elseif (is_string($date)) {
                    $eventDate = substr($date, 0, 10);
                } else {
                    $eventDate = (string) $date;
                }

                return [
                    'event_date' => $eventDate,
                    'reservation_count' => (int) $row->reservation_count,
                    'guests' => (int) $row->guests,
                ];
            })
            ->values()
            ->all();
    }
}
