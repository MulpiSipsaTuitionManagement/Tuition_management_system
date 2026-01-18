<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tutor;
use Tymon\JWTAuth\Facades\JWTAuth;

class TutorManagementTest extends TestCase
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

    public function test_can_list_tutors()
    {
        Tutor::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/tutors');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_show_tutor_details()
    {
        $tutor = Tutor::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson("/api/tutors/{$tutor->tutor_id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.full_name', $tutor->full_name);
    }

    public function test_can_update_tutor_profile()
    {
        $tutor = Tutor::factory()->create(['full_name' => 'Old Tutor Name']);

        $payload = [
            'full_name' => 'New Tutor Name',
            'email' => 'newtutor@example.com',
            'contact_no' => '9999999',
            'address' => 'New Tutor Address',
            'basic_salary' => 50000,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson("/api/tutors/{$tutor->tutor_id}", $payload);

        $response->assertStatus(200);
        $this->assertEquals('New Tutor Name', $tutor->fresh()->full_name);
    }
}
