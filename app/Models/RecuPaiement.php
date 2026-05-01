<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'paiement_id',
    'nom_fichier',
    'type_fichier',
    'chemin_fichier',
    'date_import',
])]
class RecuPaiement extends Model
{
    protected function casts(): array
    {
        return [
            'date_import' => 'datetime',
        ];
    }

    public function paiement(): BelongsTo
    {
        return $this->belongsTo(Paiement::class);
    }
}
