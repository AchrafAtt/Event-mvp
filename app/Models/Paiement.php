<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'reservation_id',
    'montant_avance',
    'mode_paiement',
    'statut_paiement',
    'date_paiement',
])]
class Paiement extends Model
{
    protected function casts(): array
    {
        return [
            'montant_avance' => 'decimal:2',
            'date_paiement' => 'date',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function recus(): HasMany
    {
        return $this->hasMany(RecuPaiement::class);
    }
}
