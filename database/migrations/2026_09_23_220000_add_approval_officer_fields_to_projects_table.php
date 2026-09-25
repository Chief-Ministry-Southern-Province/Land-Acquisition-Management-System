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
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();

            $table->foreignId('hob_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('hob_approved_at')->nullable();

            $table->foreignId('ao_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('ao_approved_at')->nullable();

            $table->foreignId('as_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('as_approved_at')->nullable();

            $table->foreignId('sas_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sas_approved_at')->nullable();

            $table->foreignId('sec_approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('sec_approved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['submitted_by']);
            $table->dropColumn(['submitted_by', 'submitted_at']);

            $table->dropForeign(['hob_approved_by']);
            $table->dropColumn(['hob_approved_by', 'hob_approved_at']);

            $table->dropForeign(['ao_approved_by']);
            $table->dropColumn(['ao_approved_by', 'ao_approved_at']);

            $table->dropForeign(['as_approved_by']);
            $table->dropColumn(['as_approved_by', 'as_approved_at']);

            $table->dropForeign(['sas_approved_by']);
            $table->dropColumn(['sas_approved_by', 'sas_approved_at']);

            $table->dropForeign(['sec_approved_by']);
            $table->dropColumn(['sec_approved_by', 'sec_approved_at']);
        });
    }
};
