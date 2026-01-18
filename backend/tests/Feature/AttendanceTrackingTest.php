<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\ClassSchedule;
use App\Models\Attendance;
use Tymon\JWTAuth\Facades\JWTAuth;

class AttendanceTrackingTest extends TestCase
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

    public function test_can_mark_attendance()
    {
        // Mock SMSService
        $this->mock(\App\Services\SMSService::class, function ($mock) {
            $mock->shouldReceive('send')->andReturn(true);
        });

        $schedule = ClassSchedule::factory()->create();
        $student = Student::factory()->create();

        $payload = [
            'schedule_id' => $schedule->schedule_id,
            'students' => [
                ['student_id' => $student->student_id, 'status' => 'Present']
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/attendance/mark', $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('attendance', [
            'schedule_id' => $schedule->schedule_id,
            'student_id' => $student->student_id,
            'status' => 'Present'
        ]);
    }

    public function test_can_get_attendance_analytics()
    {
        Attendance::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/attendance/analytics');

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data' => ['today_percentage', 'weekly_overview']]);
    }

    public function test_can_get_student_attendance_summary()
    {
        $student = Student::factory()->create();
        $schedule = ClassSchedule::factory()->create(['status' => 'Completed']);
        Attendance::factory()->create([
            'student_id' => $student->student_id,
            'schedule_id' => $schedule->schedule_id,
            'status' => 'Present'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson("/api/attendance/student-summary/{$student->student_id}");

        $response->assertStatus(200)
                 ->assertJsonPath('summary.present_count', 1);
    }
}
