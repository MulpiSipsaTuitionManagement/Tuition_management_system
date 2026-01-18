<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Classes;
use Tymon\JWTAuth\Facades\JWTAuth;

class StudentManagementTest extends TestCase
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

    public function test_can_list_students()
    {
        Student::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/students');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_show_student_details()
    {
        $student = Student::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson("/api/students/{$student->student_id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.full_name', $student->full_name);
    }

    public function test_can_update_student_profile()
    {
        $student = Student::factory()->create(['full_name' => 'Old Name']);

        $payload = [
            'full_name' => 'New Name',
            'address' => 'New Address',
            'contact_no' => '000000',
            'guardian_name' => 'New Guardian',
            'guardian_contact' => '111111',
            'emergency_contact' => '222222',
            'gender' => 'Male',
            'nic' => '12345-1234567-1',
            'email' => 'new@student.com'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson("/api/students/{$student->student_id}", $payload);

        $response->assertStatus(200);
        $this->assertEquals('New Name', $student->fresh()->full_name);
    }

    public function test_can_enroll_student_in_subjects()
    {
        $student = Student::factory()->create();
        $subject = Subject::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson("/api/students/{$student->student_id}/enroll", [
                             'subject_ids' => [$subject->subject_id]
                         ]);

        $response->assertStatus(200);
        $this->assertTrue($student->subjects->contains($subject->subject_id));
    }

    public function test_can_get_student_stats()
    {
        Student::factory()->count(5)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/students/stats');

        $response->assertStatus(200)
                 ->assertJsonPath('data.total', 5);
    }
}
