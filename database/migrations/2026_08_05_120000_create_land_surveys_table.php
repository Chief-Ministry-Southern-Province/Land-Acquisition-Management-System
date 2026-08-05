<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('land_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('land_parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->string('surveyor_name');
            $table->date('survey_date');
            $table->string('survey_ref_number')->unique();
            $table->json('survey_coordinates')->nullable(); // GeoJSON polygon details
            $table->decimal('surveyed_size_perches', 12, 2);
            $table->enum('status', ['pending', 'completed'])->default('completed');
            $table->foreignId('document_id')->constrained('documents')->restrictOnDelete(); // MANDATORY: Survey plan file
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('land_surveys');
    }
};
