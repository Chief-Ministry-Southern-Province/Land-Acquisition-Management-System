<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('land_valuations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('land_parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->string('valuer_name');
            $table->date('valuation_date');
            $table->string('valuation_ref_number')->unique();
            $table->decimal('land_value', 15, 2)->default(0);
            $table->decimal('crop_value', 15, 2)->default(0);
            $table->decimal('structure_value', 15, 2)->default(0);
            $table->decimal('total_valuation', 15, 2)->default(0); // Sum of land, crop, structure
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->foreignId('document_id')->constrained('documents')->restrictOnDelete(); // MANDATORY: Valuation report PDF
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('land_valuations');
    }
};
