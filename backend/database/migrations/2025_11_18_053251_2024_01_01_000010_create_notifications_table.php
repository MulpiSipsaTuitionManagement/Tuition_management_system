<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            
            $table->enum('type', ['Fee Reminder', 'Attendance Alert', 'Schedule Update']);
            $table->text('message');
            
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->unsignedBigInteger('student_id')->nullable();
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
            
            $table->string('recipient_phone');
            $table->enum('status', ['Sent', 'Failed']);
            $table->dateTime('sent_date')->useCurrent();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};