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
        Schema::create('project_progresses', function (Blueprint $table) {
            $table->id();
            // One-to-one relationship with projects table
            $table->foreignId('project_id')->unique()->constrained('projects')->onDelete('cascade');
            $table->json('stages');
            $table->integer('total_items')->default(0);
            $table->integer('completed_items')->default(0);
            $table->integer('progress_percentage')->default(0);
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_saved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_progresses');
    }
};
