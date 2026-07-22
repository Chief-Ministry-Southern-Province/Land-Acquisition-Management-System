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
        Schema::create('land_parcels', function (Blueprint $table) {
            $table->id();

            $table->string('parcel_id')->unique();
            $table->foreignId('project_id')->nullable()->constrained('projects')->cascadeOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('documents')->cascadeOnDelete();

            $table->string('land_name')->nullable();

            // location hierarchy fields
            $table->string('province')->default('Southern');
            $table->string('district');
            $table->string('divisional_secretariat')->nullable();
            $table->string('grama_niladari_division')->nullable();
            $table->string('village');

            // land size fields
            $table->decimal('land_size_acers', 10, 2)->default(0);
            $table->decimal('land_size_roods', 10, 2)->default(0);
            $table->decimal('land_size_perches', 10, 2)->default(0);
            $table->decimal('full_land_size', 10, 2)->default(0); // in perches

            // location map fields
            $table->decimal('latitude', 11, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('boundary_geojson')->nullable();

            $table->boolean('has_plan')->default(false);
            // If has a plan
            $table->string('plan_number')->nullable();
            $table->json('parcel_numbers')->nullable();
            // If do not have plan
            $table->string('boundaries_north')->nullable();
            $table->string('boundaries_south')->nullable();
            $table->string('boundaries_east')->nullable();
            $table->string('boundaries_west')->nullable();

            // residents
            $table->boolean('has_residential_houses')->default(false);
            $table->boolean('is_resident_owner')->default(false);

            // cultivation
            $table->boolean('is_cultivated')->default(false);
            $table->string('cultivation')->nullable();
            $table->enum('cultivation_status', ['fertile', 'mid', 'infertile', 'unspecified'])->default('unspecified');
            $table->decimal('annual_income', 12, 2)->default(0);

            $table->string('land_type')->nullable(); // Lands under litigation, donated lands

            // value
            $table->decimal('estimated_value', 12, 2)->default(0);

            $table->text('remarks')->nullable();
            $table->enum('status', ['available', 'pending', 'acquired'])->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('land_parcels');
    }
};
