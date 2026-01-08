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
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'dob')) {
                $table->date('dob')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('students', 'enrollment_date')) {
                $table->date('enrollment_date')->nullable()->after('dob');
            }
            if (!Schema::hasColumn('students', 'contact_no')) {
                $table->string('contact_no')->nullable()->after('full_name');
            }
            if (!Schema::hasColumn('students', 'nic')) {
                $table->string('nic')->nullable()->after('contact_no');
            }
            if (!Schema::hasColumn('students', 'email')) {
                $table->string('email')->nullable()->after('nic');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['dob', 'enrollment_date', 'contact_no', 'nic', 'email']);
        });
    }
};
