<?php

use App\Enums\TypeOffre;
use App\Models\Reservation;

test('type offre enum contains allowed offer packs', function () {
    expect(TypeOffre::cases())->toHaveCount(3)
        ->and(TypeOffre::Base->value)->toBe('Base')
        ->and(TypeOffre::Standard->value)->toBe('Standard')
        ->and(TypeOffre::Premium->value)->toBe('Premium');
});

test('reservation casts type_offre to enum', function () {
    $reservation = new Reservation([
        'type_offre' => TypeOffre::Standard->value,
    ]);

    expect($reservation->type_offre)->toBe(TypeOffre::Standard);
});
