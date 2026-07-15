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
        Schema::create('land_parcel_property_owner', function (Blueprint $table) {
            $table->id();
            $table->foreignId('land_parcel_id')->constrained('land_parcels')->cascadeOnDelete();
            $table->foreignId('property_owner_id')->constrained('property_owners')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('land_parcel_property_owner');
    }
};
