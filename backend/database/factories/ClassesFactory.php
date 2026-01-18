<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClassesFactory extends Factory
{
    public function definition(): array
    {
        return [
            'class_name' => fake()->randomElement(['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'O-Levels', 'A-Levels']),
            'academic_level' => fake()->randomElement(['Primary', 'Secondary', 'Higher Secondary']),
            'total_students' => 0,
            'status' => 'active',
        ];
    }
}
