<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'reservation_id',
    'type_evenement',
    'date',
    'horaire',
    'zone',
    'adresse_detaillee',
    'nombre_personnes',
    'local_naissance',
    'nom_clinique',
    'theme_anniversaire',
    'type_ceremonie',
])]
class Evenement extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'nombre_personnes' => 'integer',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
