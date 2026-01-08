<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->date('dob')->nullable();
            $table->string('gender', 10)->nullable();
            $table->date('join_date')->nullable();
            $table->string('experience')->nullable();
            $table->text('qualification')->nullable();
            $table->string('profile_photo')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->dropColumn(['dob', 'gender', 'join_date', 'experience', 'qualification', 'profile_photo']);
        });
    }
};
