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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_id');
            $table->string('title');
            $table->string('purpose');

            $table->string('institution')->nullable();
            $table->string('institution_address')->nullable();

            $table->decimal('land_area_to_be_acquired_acers', 10, 2)->default(0);
            $table->decimal('land_area_to_be_acquired_roods', 10, 2)->default(0);
            $table->decimal('land_area_to_be_acquired_perches', 10, 2)->default(0);
            $table->decimal('full_land_area_to_be_acquired', 10, 2)->default(0);

            $table->boolean('are_residents_moved_temp')->default(false);

            $table->boolean('section20_observation')->nullable();                 // Item 20
            $table->boolean('section21_secretary_report')->nullable();                 // Item 21
            $table->string('section22_secretary_recommendation')->nullable();       // Item 22
            $table->string('section23_valuation_recommendation')->nullable();       // Item 23
            $table->boolean('section24_decision_remarks')->nullable();                 // Item 24
            $table->string('section25_additional_conditions')->nullable();       // Item 25
            $table->boolean('section26_final_recommendation')->nullable();       // Item 26

            $table->date('approval_date')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');

            $table->enum('case_status', ['not_started', 'pending', 'rejected', 'completed'])->default('pending'); // active, pending, rejected, completed
            $table->enum('do_status', ['draft', 'submitted'])->default('draft'); // draft, submitted
            $table->enum('hob_status', ['approved', 'pending', 'rejected'])->default('pending'); // approved, pending, rejected
            $table->enum('ao_status', ['approved', 'pending', 'rejected'])->default('pending'); // approved, pending, rejected
            $table->enum('as_status', ['approved', 'pending', 'rejected'])->default('pending'); // approved, pending, rejected
            $table->enum('sas_status', ['approved', 'pending', 'rejected'])->default('pending'); // approved, pending, rejected
            $table->enum('sec_status', ['approved', 'pending', 'rejected'])->default('pending'); // approved, pending, rejected

            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
