<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class EventControllerTest extends TestCase
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

    public function test_can_list_events()
    {
        Event::create(['title' => 'Science Fair', 'event_date' => '2026-03-15', 'description' => 'Test']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/events');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonCount(1, 'data');
    }

    public function test_can_create_event()
    {
        $payload = ['title' => 'Sports Day', 'event_date' => '2026-02-20', 'description' => 'Annual sports'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/events', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('events', ['title' => 'Sports Day']);
    }
}
