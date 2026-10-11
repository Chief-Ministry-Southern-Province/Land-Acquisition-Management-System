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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('land_parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->string('receipt_number');
            $table->date('receipt_date');
            $table->string('received_from');
            $table->decimal('amount_rupees', 15, 2)->default(0);
            $table->unsignedTinyInteger('amount_cents')->default(0);
            $table->text('reason');
            $table->foreignId('document_id')->constrained('documents')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
