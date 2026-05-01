<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'banque',
    'titulaire',
    'rib',
])]
class CoordonneesBancaires extends Model {}
