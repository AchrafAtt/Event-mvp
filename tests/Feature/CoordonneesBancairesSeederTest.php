<?php

use App\Models\CoordonneesBancaires;
use Database\Seeders\CoordonneesBancairesSeeder;
use Illuminate\Support\Facades\Config;

test('CoordonneesBancairesSeeder skips when banking config is incomplete', function () {
    Config::set('banking.banque', 'Banque');
    Config::set('banking.titulaire', '');
    Config::set('banking.rib', '123');

    $this->seed(CoordonneesBancairesSeeder::class);

    expect(CoordonneesBancaires::query()->count())->toBe(0);
});

test('CoordonneesBancairesSeeder creates bank row when config is complete', function () {
    Config::set('banking.banque', 'BP');
    Config::set('banking.titulaire', 'Jane Doe');
    Config::set('banking.rib', 'RIB123');

    $this->seed(CoordonneesBancairesSeeder::class);

    $row = CoordonneesBancaires::query()->first();

    expect($row)->not->toBeNull()
        ->and($row->banque)->toBe('BP')
        ->and($row->titulaire)->toBe('Jane Doe')
        ->and($row->rib)->toBe('RIB123');
});

test('CoordonneesBancairesSeeder updates existing row on second seed', function () {
    Config::set('banking.banque', 'CIH');
    Config::set('banking.titulaire', 'First');
    Config::set('banking.rib', '111');

    $this->seed(CoordonneesBancairesSeeder::class);

    Config::set('banking.banque', 'BMCE');
    Config::set('banking.titulaire', 'Second');
    Config::set('banking.rib', '222');

    $this->seed(CoordonneesBancairesSeeder::class);

    expect(CoordonneesBancaires::query()->count())->toBe(1);

    $row = CoordonneesBancaires::query()->first();

    expect($row->banque)->toBe('BMCE')
        ->and($row->titulaire)->toBe('Second')
        ->and($row->rib)->toBe('222');
});
