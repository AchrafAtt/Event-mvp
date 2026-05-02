<?php

namespace App\Enums;

enum TypeEvenement: string
{
    case Naissance = 'Naissance';
    case Fiancailles = 'Fiancailles';
    case ActeDeMariage = 'Acte de mariage';
    case FeteHenna = 'Fete Henna';
    case Anniversaire = 'Anniversaire';
}
