<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Holiday;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class HolidayReproductionTest extends TestCase
{
    use RefreshDatabase;

    public function test_holiday_creation_with_valid_data()
    {
        $admin = User::create([
            'username' => 'admin',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true
        ]);
        $token = JWTAuth::fromUser($admin);

        $payload = [
            'name' => 'Sample Holiday',
            'holiday_date' => '2026-05-01'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/holidays', $payload);

        $response->assertStatus(201);
    }

    public function test_holiday_creation_with_duplicate_date()
    {
        $admin = User::create([
            'username' => 'admin',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true
        ]);
        $token = JWTAuth::fromUser($admin);

        Holiday::create(['name' => 'First Holiday', 'holiday_date' => '2026-05-01']);

        $payload = [
            'name' => 'Second Holiday',
            'holiday_date' => '2026-05-01'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/holidays', $payload);

        $response->dump();
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['holiday_date']);
    }
}
