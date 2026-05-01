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
        Schema::create('personnalisations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->string('style_decoration');
            $table->text('texte_personnalise')->nullable();
            $table->text('remarques')->nullable();
            $table->decimal('tarif_fixe', 10, 2)->default(0);
            $table->decimal('prix_par_personne', 10, 2)->default(0);
            $table->unsignedInteger('nombre_personnes')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personnalisations');
    }
};
