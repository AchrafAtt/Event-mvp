<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PaiementController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\RecuPaiementController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Espace client
Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('reservations', ReservationController::class)
        ->only(['index', 'create', 'store', 'show']);

    Route::post('reservations/{reservation}/recu', [RecuPaiementController::class, 'store'])
        ->name('reservations.recu.store');
});

// Espace admin
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('reservations', [AdminReservationController::class, 'index'])->name('reservations.index');
    Route::patch('reservations/{reservation}/statut', [AdminReservationController::class, 'changerStatut'])->name('reservations.statut');

    Route::patch('paiements/{paiement}/valider', [PaiementController::class, 'valider'])->name('paiements.valider');
    Route::patch('paiements/{paiement}/refuser', [PaiementController::class, 'refuser'])->name('paiements.refuser');
});

require __DIR__.'/settings.php';
