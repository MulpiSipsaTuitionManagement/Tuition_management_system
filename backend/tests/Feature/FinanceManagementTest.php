<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\Fee;
use App\Models\Salary;
use App\Models\Classes;
use Tymon\JWTAuth\Facades\JWTAuth;

class FinanceManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::create([
            'username' => 'admin_test',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true
        ]);
        $this->token = JWTAuth::fromUser($this->admin);
    }

    public function test_can_generate_monthly_fees()
    {
        // Mock SMSService
        $this->mock(\App\Services\SMSService::class, function ($mock) {
            $mock->shouldReceive('send')->andReturn(true);
        });

        Student::factory()->create(['total_monthly_fee' => 5000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/fees/generate', [
                             'month' => now()->format('Y-m')
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('fees', ['amount' => 5000]);
    }

    public function test_can_mark_fee_as_paid()
    {
        $fee = Fee::factory()->create(['status' => 'pending']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson("/api/fees/{$fee->fee_id}/pay");

        $response->assertStatus(200);
        $this->assertEquals('paid', $fee->fresh()->status);
    }

    public function test_can_generate_monthly_salaries()
    {
        Tutor::factory()->create(['basic_salary' => 60000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/salaries/generate', [
                             'month' => now()->format('Y-m')
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('salaries', ['net_salary' => 60000]);
    }

    public function test_can_mark_salary_as_paid()
    {
        $salary = Salary::factory()->create(['status' => 'Pending']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson("/api/salaries/{$salary->salary_id}/pay");

        $response->assertStatus(200);
        $this->assertEquals('Paid', $salary->fresh()->status);
    }
}
