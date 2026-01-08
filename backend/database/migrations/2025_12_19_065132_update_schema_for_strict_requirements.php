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
        Schema::table('classes', function (Blueprint $table) {
            $table->string('academic_level')->nullable()->after('class_name');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('total_students');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('class_id')->nullable()->constrained('classes', 'class_id')->onDelete('set null')->after('user_id');
            $table->decimal('total_monthly_fee', 10, 2)->default(0)->after('grade');
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->integer('total_students')->default(0)->after('monthly_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn(['academic_level', 'status']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropColumn(['class_id', 'total_monthly_fee']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('total_students');
        });
    }
};
