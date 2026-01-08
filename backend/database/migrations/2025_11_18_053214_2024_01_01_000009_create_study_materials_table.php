<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_materials', function (Blueprint $table) {
            $table->id('material_id');
            
            $table->unsignedBigInteger('subject_id');
            $table->foreign('subject_id')->references('subject_id')->on('subjects')->onDelete('cascade');
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_size')->nullable();
            
            $table->unsignedBigInteger('uploaded_by');
            $table->foreign('uploaded_by')->references('tutor_id')->on('tutors')->onDelete('cascade');
            
            $table->dateTime('uploaded_date')->useCurrent();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_materials');
    }
};
