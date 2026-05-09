<?php

namespace App\Models;

use App\Enums\StatutReservation;
use App\Enums\TypeOffre;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'reference',
    'user_id',
    'type_service',
    'type_offre',
    'date_reservation',
    'statut',
    'prix_total',
    'avance',
    'reste_a_payer',
    'remarques',
    'ticket_token',
    'ticket_qr_path',
    'ticket_generated_at',
])]
class Reservation extends Model
{
    protected function casts(): array
    {
        return [
            'type_offre' => TypeOffre::class,
            'statut' => StatutReservation::class,
            'date_reservation' => 'date',
            'prix_total' => 'decimal:2',
            'avance' => 'decimal:2',
            'reste_a_payer' => 'decimal:2',
            'ticket_generated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function evenement(): HasOne
    {
        return $this->hasOne(Evenement::class);
    }

    public function personnalisation(): HasOne
    {
        return $this->hasOne(Personnalisation::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function ticketQrAbsoluteUrl(): ?string
    {
        if ($this->statut !== StatutReservation::Confirmee || ! filled($this->ticket_qr_path)) {
            return null;
        }

        if (! Storage::disk('local')->exists((string) $this->ticket_qr_path)) {
            return null;
        }

        return route('reservations.ticket-qr', $this, absolute: true);
    }

    public function ticketVerifyAbsoluteUrl(): ?string
    {
        if (! filled($this->ticket_token)) {
            return null;
        }

        return route('tickets.show', ['token' => $this->ticket_token], absolute: true);
    }
}
