<?php

namespace Database\Factories;

use App\Models\Subject;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudyMaterialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'subject_id' => Subject::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'file_path' => '/storage/materials/test.pdf',
            'file_size' => '1MB',
            'uploaded_by' => Tutor::factory(),
            'uploaded_date' => now(),
        ];
    }
}
