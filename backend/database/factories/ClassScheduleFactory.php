<?php

namespace Database\Factories;

use App\Models\Classes;
use App\Models\Subject;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'class_id' => Classes::factory(),
            'subject_id' => Subject::factory(),
            'tutor_id' => Tutor::factory(),
            'schedule_date' => fake()->date(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'status' => 'Scheduled',
        ];
    }
}
