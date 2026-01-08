<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id('subject_id');
            $table->string('subject_name');
            $table->string('grade')->nullable(); // Can limit to enum if needed, but string is flexible
            
            $table->unsignedBigInteger('class_id');
            $table->foreign('class_id')->references('class_id')->on('classes')->onDelete('cascade');
            
            $table->unsignedBigInteger('tutor_id');
            $table->foreign('tutor_id')->references('tutor_id')->on('tutors')->onDelete('cascade');
            
            $table->decimal('monthly_fee', 10, 2);
            $table->text('study_materials')->nullable(); // As per schema text
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
