<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id('salary_id');
            
            $table->unsignedBigInteger('tutor_id');
            $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->onDelete('cascade');
            
            $table->string('month'); // e.g. "January 2025"
            $table->decimal('base_amount', 10, 2);
            $table->decimal('allowances', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2);
            $table->date('payment_date')->nullable();
            $table->enum('status', ['Paid', 'Pending']);
            
            $table->unsignedBigInteger('recorded_by');
            $table->foreign('recorded_by')->references('user_id')->on('users');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
