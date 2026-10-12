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
        Schema::create('project_checklist_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->integer('milestone_months'); // 3, 6, 9, 12, ...
            $table->foreignId('do_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('first_reminder_sent_at')->nullable();
            $table->timestamp('second_reminder_sent_at')->nullable();
            $table->timestamp('escalated_to_sas_at')->nullable();
            $table->foreignId('sas_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('progress_updated_at')->nullable();
            $table->string('status', 32)->default('pending_do'); // pending_do, second_reminder_sent, escalated_to_sas, resolved
            $table->timestamps();

            $table->unique(['project_id', 'milestone_months']);
            $table->index(['project_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_checklist_reminders');
    }
};
