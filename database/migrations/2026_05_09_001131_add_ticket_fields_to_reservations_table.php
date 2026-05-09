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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('ticket_token', 64)->nullable()->unique()->after('remarques');
            $table->string('ticket_qr_path')->nullable()->after('ticket_token');
            $table->timestamp('ticket_generated_at')->nullable()->after('ticket_qr_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['ticket_token', 'ticket_qr_path', 'ticket_generated_at']);
        });
    }
};
