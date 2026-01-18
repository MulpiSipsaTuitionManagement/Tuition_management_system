<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TutorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'tutor']),
            'full_name' => fake()->name(),
            'nic' => '12345-6789012-3',
            'email' => fake()->unique()->safeEmail(),
            'contact_no' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'basic_salary' => fake()->numberBetween(20000, 100000),
            'emergency_contact' => fake()->phoneNumber(),
            'dob' => fake()->date('Y-m-d', '-20 years'),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'join_date' => fake()->date(),
            'experience' => fake()->numberBetween(1, 15) . ' years',
            'qualification' => fake()->randomElement(['Bachelors', 'Masters', 'PhD']),
            'profile_photo' => null,
        ];
    }
}
