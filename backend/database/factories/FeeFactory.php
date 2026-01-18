<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'subject_id' => Subject::factory(),
            'amount' => fake()->numberBetween(1000, 5000),
            'due_date' => fake()->dateTimeBetween('now', '+1 month'),
            'paid_date' => null,
            'status' => 'Pending',
            'remarks' => fake()->sentence(),
            'recorded_by' => User::factory()->state(['role' => 'admin']),
        ];
    }
}
