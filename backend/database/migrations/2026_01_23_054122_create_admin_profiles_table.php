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
        Schema::create('admin_profiles', function (Blueprint $table) {
            $table->id('admin_id');
            $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
            $table->text('full_name')->nullable();
            $table->text('profile_photo')->nullable();
            $table->text('nic')->nullable();
            $table->text('dob')->nullable();
            $table->text('gender')->nullable();
            $table->text('email')->nullable();
            $table->text('contact_no')->nullable();
            $table->text('address')->nullable();
            $table->text('join_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_profiles');
    }
};
