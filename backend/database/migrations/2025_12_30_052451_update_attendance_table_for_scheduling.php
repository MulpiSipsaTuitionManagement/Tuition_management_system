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
        Schema::table('attendance', function (Blueprint $table) {
            // Drop old foreign keys first if they exist
            $table->dropForeign(['class_id']);
            $table->dropForeign(['marked_by']);
            
            // Add schedule_id
            $table->unsignedBigInteger('schedule_id')->after('attendance_id')->nullable();
            $table->foreign('schedule_id')->references('schedule_id')->on('class_schedules')->onDelete('cascade');
            
            // Change status enum (Doctrine doesn't support enum changes easily, so we might need a raw query or drop and add)
            $table->string('status', 20)->change(); // Temporary string to allow more values
            
            // Re-link marked_by to users table
            $table->unsignedBigInteger('marked_by')->nullable()->change();
            $table->foreign('marked_by')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
            $table->dropColumn('schedule_id');
            
            $table->dropForeign(['marked_by']);
            $table->unsignedBigInteger('marked_by')->nullable(false)->change();
            $table->foreign('marked_by')->references('tutor_id')->on('tutors')->onDelete('cascade');
            
            $table->foreign('class_id')->references('class_id')->on('classes')->onDelete('cascade');
        });
    }
};
