<?php

namespace App\Enums;

enum StatutReservation: string
{
    case EnAttente = 'en_attente';
    case Confirmee = 'confirmee';
    case Annulee = 'annulee';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Confirmee => 'Confirmée',
            self::Annulee => 'Annulée',
        };
    }
}
