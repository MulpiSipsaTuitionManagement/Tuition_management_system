<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\ClassSchedule;
use App\Models\Classes;
use App\Models\Subject;
use App\Models\Tutor;
use Tymon\JWTAuth\Facades\JWTAuth;

class ScheduleManagementTest extends TestCase
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

    public function test_can_list_schedules()
    {
        ClassSchedule::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/schedules');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_create_schedule()
    {
        $class = Classes::factory()->create();
        $subject = Subject::factory()->create();
        $tutor = Tutor::factory()->create();

        $payload = [
            'class_id' => $class->class_id,
            'subject_id' => $subject->subject_id,
            'tutor_id' => $tutor->tutor_id,
            'schedule_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '10:00:00',
            'end_time' => '11:00:00',
            'status' => 'Upcoming'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/schedules', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('class_schedules', ['start_time' => '10:00:00']);
    }

    public function test_cannot_create_conflicting_schedule()
    {
        $tutor = Tutor::factory()->create();
        $tutorId = $tutor->tutor_id;
        $date = now()->addDay()->format('Y-m-d');

        ClassSchedule::factory()->create([
            'tutor_id' => $tutorId,
            'schedule_date' => $date,
            'start_time' => '10:00:00',
            'end_time' => '11:00:00'
        ]);

        $payload = [
            'class_id' => Classes::factory()->create()->class_id,
            'subject_id' => Subject::factory()->create()->subject_id,
            'tutor_id' => $tutorId,
            'schedule_date' => $date,
            'start_time' => '10:30:00',
            'end_time' => '11:30:00'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/schedules', $payload);

        $response->assertStatus(409);
    }
}
