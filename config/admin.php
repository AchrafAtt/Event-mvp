<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default admin (database seeding)
    |--------------------------------------------------------------------------
    |
    | Used by AdminUserSeeder on db:seed / migrate --seed. Leave empty to skip
    | creating a default admin. The seeder is idempotent: it will not create a
    | duplicate if a user with this email already exists.
    |
    */

    'email' => env('ADMIN_EMAIL'),

    'password' => env('ADMIN_PASSWORD'),

    'nom' => env('ADMIN_NOM', 'Administrateur'),

];
