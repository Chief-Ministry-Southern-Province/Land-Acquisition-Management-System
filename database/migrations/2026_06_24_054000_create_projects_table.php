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
            $table->string('name');
            $table->string('ministry');
            $table->string('department');
            $table->string('project_type');
            $table->string('acquisition_act');
            $table->string('district');
            $table->string('division');
            $table->string('purpose');
            $table->date('start_date');
            $table->date('estimated_completion');
            $table->decimal('budget_im_mn', 5, 2);
            $table->enum('status', ['active', 'pending', 'completed']); // active, pending, completed
            $table->string('project_manager');
            $table->string('contact');
            $table->string('email');
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
