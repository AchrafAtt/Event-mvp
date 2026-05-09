<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default bank transfer details (database seeding)
    |--------------------------------------------------------------------------
    |
    | Used by CoordonneesBancairesSeeder on db:seed / migrate --seed. Leave all
    | empty to skip. When set, the seeder keeps a single row in sync with these
    | values (updates the first row if one already exists).
    |
    */

    'banque' => env('ADMIN_BANK_NAME'),

    'titulaire' => env('ADMIN_TITULAR'),

    'rib' => env('ADMIN_RIB'),

];
