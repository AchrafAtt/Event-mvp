<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Support\Facades\Config;

test('admin user seeder creates one admin when config is set and can be run twice safely', function () {
    Config::set('admin.email', 'seed-admin@example.test');
    Config::set('admin.password', 'secret-password-123');
    Config::set('admin.nom', 'Seed Admin');

    (new AdminUserSeeder)->run();
    (new AdminUserSeeder)->run();

    $users = User::query()->where('email', 'seed-admin@example.test')->get();

    expect($users)->toHaveCount(1)
        ->and($users->first()->role)->toBe('admin')
        ->and($users->first()->nom)->toBe('Seed Admin');
});

test('admin user seeder skips when email or password is missing', function () {
    Config::set('admin.email', '');
    Config::set('admin.password', '');

    (new AdminUserSeeder)->run();

    expect(User::query()->count())->toBe(0);
});
