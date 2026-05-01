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
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->string('type_evenement');
            $table->date('date');
            $table->time('horaire');
            $table->string('zone');
            $table->text('adresse_detaillee');
            $table->unsignedInteger('nombre_personnes');
            // Naissance
            $table->string('local_naissance')->nullable();
            $table->string('nom_clinique')->nullable();
            // Anniversaire
            $table->string('theme_anniversaire')->nullable();
            // Graduation
            $table->string('type_ceremonie')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};
