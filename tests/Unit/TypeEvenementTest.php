<?php

use App\Enums\TypeEvenement;
use App\Models\Evenement;

test('type evenement enum contains allowed landing event types', function () {
    expect(TypeEvenement::cases())->toHaveCount(5)
        ->and(TypeEvenement::Naissance->value)->toBe('Naissance')
        ->and(TypeEvenement::Fiancailles->value)->toBe('Fiancailles')
        ->and(TypeEvenement::ActeDeMariage->value)->toBe('Acte de mariage')
        ->and(TypeEvenement::FeteHenna->value)->toBe('Fete Henna')
        ->and(TypeEvenement::Anniversaire->value)->toBe('Anniversaire');
});

test('evenement casts type_evenement to enum', function () {
    $evenement = new Evenement([
        'type_evenement' => TypeEvenement::Naissance->value,
    ]);

    expect($evenement->type_evenement)->toBe(TypeEvenement::Naissance);
});
