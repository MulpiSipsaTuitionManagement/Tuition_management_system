<?php

namespace Database\Factories;

use App\Models\Classes;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'subject_name' => fake()->randomElement(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography']),
            'grade' => fake()->randomElement(['Secondary', 'Primary']),
            'class_id' => Classes::factory(),
            'tutor_id' => Tutor::factory(),
            'monthly_fee' => fake()->numberBetween(1000, 5000),
            'total_students' => 0,
            'study_materials' => null,
        ];
    }
}
