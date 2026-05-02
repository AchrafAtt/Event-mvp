<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('personnalisations', function (Blueprint $table) {
            $table->json('couleurs')->nullable()->after('style_decoration');
            $table->json('accessoires')->nullable()->after('couleurs');
            $table->unsignedInteger('personnes_supplementaires')->default(0)->after('nombre_personnes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personnalisations', function (Blueprint $table) {
            $table->dropColumn(['couleurs', 'accessoires', 'personnes_supplementaires']);
        });
    }
};
