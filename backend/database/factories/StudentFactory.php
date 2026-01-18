<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Classes;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'student']),
            'class_id' => Classes::factory(),
            'full_name' => fake()->name(),
            'address' => fake()->address(),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'grade' => fake()->randomElement(['O-Level', 'A-Level', 'Grade 10']),
            'guardian_name' => fake()->name(),
            'guardian_contact' => fake()->phoneNumber(),
            'emergency_contact' => fake()->phoneNumber(),
            'enrollment_date' => fake()->date(),
            'dob' => fake()->date('Y-m-d', '-15 years'),
            'contact_no' => fake()->phoneNumber(),
            'nic' => '12345-6789012-3',
            'email' => fake()->unique()->safeEmail(),
            'total_monthly_fee' => fake()->numberBetween(2000, 10000),
            'profile_photo' => null,
        ];
    }
}
