<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id('student_id');
            // Explicitly define FK to user_id
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');

            $table->string('full_name');
            $table->text('address');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->string('grade')->nullable();
            $table->string('guardian_name');
            $table->string('guardian_contact');
            $table->string('emergency_contact')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};