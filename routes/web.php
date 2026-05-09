<?php

use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PaiementController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RecuPaiementController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ReservationTicketQrController;
use App\Http\Controllers\TicketVerificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('tickets/{token}', [TicketVerificationController::class, 'show'])
    ->name('tickets.show');

// Espace client
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('admin')
        ->name('dashboard');

    Route::get('reservations/client-info', [ReservationController::class, 'clientInfo'])
        ->name('reservations.client-info');
    Route::get('reservations/event-details', [ReservationController::class, 'eventDetails'])
        ->name('reservations.event-details');
    Route::get('reservations/personalisation', [ReservationController::class, 'personalisation'])
        ->name('reservations.personalisation');
    Route::get('reservations/offer-price', [ReservationController::class, 'offerPrice'])
        ->name('reservations.offer-price');

    Route::get('reservations/payment', [ReservationController::class, 'payment'])
        ->name('reservations.payment');
    Route::post('reservations/complete-wizard', [ReservationController::class, 'completeWizard'])
        ->name('reservations.complete-wizard');
    Route::get('reservations/{reservation}/confirmation', [ReservationController::class, 'confirmation'])
        ->name('reservations.confirmation');

    Route::get('reservations/{reservation}/ticket-qr', [ReservationTicketQrController::class, 'show'])
        ->name('reservations.ticket-qr');

    Route::resource('reservations', ReservationController::class)
        ->only(['index', 'create', 'store', 'show']);

    Route::post('reservations/{reservation}/recu', [RecuPaiementController::class, 'store'])
        ->name('reservations.recu.store');
});

// Espace admin
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar');

    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportsController::class, 'export'])->name('reports.export');

    Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('clients/{user}', [ClientController::class, 'show'])->name('clients.show');

    Route::get('reservations', [AdminReservationController::class, 'index'])->name('reservations.index');
    Route::get('reservations/{reservation}', [AdminReservationController::class, 'show'])->name('reservations.show');
    Route::patch('reservations/{reservation}/statut', [AdminReservationController::class, 'changerStatut'])->name('reservations.statut');

    Route::patch('paiements/{paiement}/valider', [PaiementController::class, 'valider'])->name('paiements.valider');
    Route::patch('paiements/{paiement}/refuser', [PaiementController::class, 'refuser'])->name('paiements.refuser');
});

require __DIR__.'/settings.php';
