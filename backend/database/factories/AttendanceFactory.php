<?php

namespace Database\Factories;

use App\Models\ClassSchedule;
use App\Models\Classes;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'schedule_id' => ClassSchedule::factory(),
            'class_id' => Classes::factory(),
            'student_id' => Student::factory(),
            'attendance_date' => fake()->date(),
            'status' => fake()->randomElement(['Present', 'Absent', 'Late']),
            'marked_by' => User::factory()->state(['role' => 'admin']),
        ];
    }
}
