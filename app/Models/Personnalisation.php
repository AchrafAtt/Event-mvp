<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'reservation_id',
    'style_decoration',
    'texte_personnalise',
    'remarques',
    'tarif_fixe',
    'prix_par_personne',
    'nombre_personnes',
])]
class Personnalisation extends Model
{
    protected function casts(): array
    {
        return [
            'tarif_fixe' => 'decimal:2',
            'prix_par_personne' => 'decimal:2',
            'nombre_personnes' => 'integer',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
