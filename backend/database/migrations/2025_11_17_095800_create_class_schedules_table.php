<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_schedules', function (Blueprint $table) {
            $table->id('schedule_id');
            
            $table->unsignedBigInteger('class_id');
            $table->foreign('class_id')->references('class_id')->on('classes')->onDelete('cascade');
            
            $table->unsignedBigInteger('subject_id');
            $table->foreign('subject_id')->references('subject_id')->on('subjects')->onDelete('cascade');
            
            $table->unsignedBigInteger('tutor_id');
            $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->onDelete('cascade');
            
            $table->date('schedule_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['Scheduled', 'Rescheduled', 'Cancelled', 'Completed']);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_schedules');
    }
};
