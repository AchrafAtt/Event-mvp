<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tableau de bord admin avec statistiques globales.
     */
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_reservations' => Reservation::count(),
                'reservations_en_attente' => Reservation::where('statut', 'en_attente')->count(),
                'reservations_confirmees' => Reservation::where('statut', 'confirmee')->count(),
                'total_clients' => User::where('role', 'client')->count(),
                'revenus_total' => Paiement::where('statut_paiement', 'confirme')->sum('montant_avance'),
            ],
        ]);
    }
}
