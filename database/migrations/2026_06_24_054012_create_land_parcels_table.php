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
            $table->string('lot_no');
            $table->string('district');
            $table->string('division');
            $table->string('village');
            $table->decimal('extent_acers', 10, 2);
            $table->decimal('extent_perches', 10, 2);
            $table->text('remarks')->nullable();
            $table->enum('status', ['available', 'pending', 'acquired', 'in-progress'])->default('available');
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
