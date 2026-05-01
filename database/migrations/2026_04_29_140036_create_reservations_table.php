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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type_service');
            $table->string('type_offre');
            $table->date('date_reservation');
            $table->string('statut')->default('en_attente');
            $table->decimal('prix_total', 10, 2)->default(0);
            $table->decimal('avance', 10, 2)->default(0);
            $table->decimal('reste_a_payer', 10, 2)->default(0);
            $table->text('remarques')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
