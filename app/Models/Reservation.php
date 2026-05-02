<?php

namespace App\Models;

use App\Enums\TypeOffre;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
])]
class Reservation extends Model
{
    protected function casts(): array
    {
        return [
            'type_offre' => TypeOffre::class,
            'date_reservation' => 'date',
            'prix_total' => 'decimal:2',
            'avance' => 'decimal:2',
            'reste_a_payer' => 'decimal:2',
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
}
