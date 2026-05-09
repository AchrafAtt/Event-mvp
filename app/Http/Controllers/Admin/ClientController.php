<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    /**
     * Liste des clients avec recherche et nombre de réservations.
     */
    public function index(Request $request): Response
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        $clients = User::query()
            ->where('role', 'client')
            ->withCount('reservations')
            ->when($request->search, function ($query, string $search) {
                $like = '%'.$search.'%';
                $query->where(function ($q) use ($like) {
                    $q->where('nom', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('telephone', 'like', $like);
                });
            })
            ->orderBy('nom')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/clients/index', [
            'clients' => $clients,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Détail d'un client et liste paginée de ses réservations.
     */
    public function show(Request $request, User $user): Response
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        if ($user->role !== 'client') {
            abort(404);
        }

        $reservations = $user->reservations()
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/clients/show', [
            'client' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'ville' => $user->ville,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'reservations' => $reservations,
        ]);
    }
}
