<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            // Drop old foreign key
            $table->dropForeign(['tutor_id']);
            
            // Re-recreate as nullable with set null on delete
            $table->unsignedBigInteger('tutor_id')->nullable()->change();
            $table->foreign('tutor_id')
                  ->references('tutor_id')
                  ->on('tutors')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropForeign(['tutor_id']);
            $table->unsignedBigInteger('tutor_id')->nullable(false)->change();
            $table->foreign('tutor_id')
                  ->references('tutor_id')
                  ->on('tutors')
                  ->onDelete('cascade');
        });
    }
};
