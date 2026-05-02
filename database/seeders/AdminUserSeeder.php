<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Create the default admin user from config when credentials are set
     * and no user with that email exists yet.
     */
    public function run(): void
    {
        $email = (string) config('admin.email', '');
        $password = (string) config('admin.password', '');

        if ($email === '' || $password === '') {
            if ($this->command !== null) {
                $this->command->warn('Skipping AdminUserSeeder: ADMIN_EMAIL and ADMIN_PASSWORD must both be set.');
            }

            return;
        }

        if (User::query()->where('email', $email)->exists()) {
            if ($this->command !== null) {
                $this->command->info("Skipping AdminUserSeeder: user with email [{$email}] already exists.");
            }

            return;
        }

        User::query()->create([
            'nom' => (string) config('admin.nom', 'Administrateur'),
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        if ($this->command !== null) {
            $this->command->info("Default admin user created: {$email}");
        }
    }
}
