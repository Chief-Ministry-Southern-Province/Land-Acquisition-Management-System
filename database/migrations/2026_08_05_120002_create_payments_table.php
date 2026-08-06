<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compensation_id')->constrained('compensation')->cascadeOnDelete();
            $table->string('payment_reference')->unique(); // Cheque number or bank transfer transaction ID
            $table->decimal('amount_paid', 15, 2);
            $table->date('payment_date');
            $table->string('payment_method'); // 'cheque', 'bank_transfer', etc.
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->enum('status', ['completed', 'pending', 'failed'])->default('completed');
            $table->foreignId('document_id')->constrained('documents')->restrictOnDelete(); // MANDATORY: Payment receipt PDF
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('payments');
    }
};
