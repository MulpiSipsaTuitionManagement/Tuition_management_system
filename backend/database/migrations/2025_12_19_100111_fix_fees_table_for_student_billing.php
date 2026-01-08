<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fees', function (Blueprint $table) {
            $table->unsignedBigInteger('subject_id')->nullable()->change();
            // Change enum to lowercase for better alignment with frontend
            $table->string('status')->change(); // Temporary change to string to allow enum change
        });

        // Use raw query for enum change if needed, or just leave it as string for flexibility
        // Actually, let's just make it a string to avoid enum headache in migrations
        Schema::table('fees', function (Blueprint $table) {
            $table->string('status', 20)->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('fees', function (Blueprint $table) {
            $table->unsignedBigInteger('subject_id')->nullable(false)->change();
            $table->enum('status', ['Paid', 'Pending', 'Overdue'])->change();
        });
    }
};
