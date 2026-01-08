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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id('announcement_id');
            $table->string('title');
            $table->text('message');
            $table->enum('audience', ['all', 'students', 'tutors']);
            $table->enum('scope', ['entire_system', 'class', 'subject']);
            
            $table->unsignedBigInteger('class_id')->nullable();
            $table->foreign('class_id')->references('class_id')->on('classes')->onDelete('cascade');
            
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->foreign('subject_id')->references('subject_id')->on('subjects')->onDelete('cascade');
            
            $table->unsignedBigInteger('created_by');
            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
