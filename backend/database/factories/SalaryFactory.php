<?php

namespace Database\Factories;

use App\Models\Tutor;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tutor_id' => Tutor::factory(),
            'month' => fake()->monthName(),
            'base_amount' => 50000,
            'allowances' => 5000,
            'bonus' => 2000,
            'deductions' => 1000,
            'net_salary' => 56000,
            'payment_date' => null,
            'status' => 'Pending',
            'recorded_by' => User::factory()->state(['role' => 'admin']),
        ];
    }
}
