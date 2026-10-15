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
        Schema::table('land_parcels', function (Blueprint $table) {
            $table->boolean('is_assigned_by_ds')->default(false)->nullable()->after('is_donated');
            $table->date('ds_handover_date')->nullable()->after('is_assigned_by_ds');
            $table->string('ds_handover_reference')->nullable()->after('ds_handover_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('land_parcels', function (Blueprint $table) {
            $table->dropColumn([
                'is_assigned_by_ds',
                'ds_handover_date',
                'ds_handover_reference',
            ]);
        });
    }
};
