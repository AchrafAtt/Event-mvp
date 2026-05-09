<?php

namespace Database\Seeders;

use App\Models\CoordonneesBancaires;
use Illuminate\Database\Seeder;

class CoordonneesBancairesSeeder extends Seeder
{
    /**
     * Upsert the singleton bank details row from config (.env).
     */
    public function run(): void
    {
        $banque = trim((string) config('banking.banque', ''));
        $titulaire = trim((string) config('banking.titulaire', ''));
        $rib = trim((string) config('banking.rib', ''));

        if ($banque === '' || $titulaire === '' || $rib === '') {
            if ($this->command !== null) {
                $this->command->warn('Skipping CoordonneesBancairesSeeder: ADMIN_BANK_NAME, ADMIN_TITULAR, and ADMIN_RIB must all be set.');
            }

            return;
        }

        $existing = CoordonneesBancaires::query()->first();

        if ($existing !== null) {
            $existing->update([
                'banque' => $banque,
                'titulaire' => $titulaire,
                'rib' => $rib,
            ]);

            if ($this->command !== null) {
                $this->command->info('Coordonnees bancaires updated from environment.');
            }

            return;
        }

        CoordonneesBancaires::query()->create([
            'banque' => $banque,
            'titulaire' => $titulaire,
            'rib' => $rib,
        ]);

        if ($this->command !== null) {
            $this->command->info('Coordonnees bancaires created from environment.');
        }
    }
}
