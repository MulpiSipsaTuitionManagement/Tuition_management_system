<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Announcement;
use Tymon\JWTAuth\Facades\JWTAuth;

class AnnouncementTest extends TestCase
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

    public function test_can_get_announcements_list()
    {
        Announcement::create([
            'title' => 'Test Announcement',
            'message' => 'This is a test message',
            'audience' => 'all',
            'scope' => 'entire_system',
            'created_by' => $this->admin->user_id
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/announcements');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true)
                 ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_store_announcement()
    {
        // Mock SMSService
        $mock = $this->mock(\App\Services\SMSService::class, function ($mock) {
            $mock->shouldReceive('send')->andReturn(true);
        });

        $payload = [
            'title' => 'New Announcement',
            'message' => 'Hello World',
            'audience' => 'all',
            'scope' => 'entire_system'
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/announcements', $payload);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $this->assertDatabaseHas('announcements', [
            'title' => 'New Announcement'
        ]);
    }

    public function test_can_delete_announcement()
    {
        $announcement = Announcement::create([
            'title' => 'Delete Me',
            'message' => 'Test message',
            'audience' => 'all',
            'scope' => 'entire_system',
            'created_by' => $this->admin->user_id
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->deleteJson("/api/announcements/{$announcement->announcement_id}");

        $response->assertStatus(200);
        $this->assertModelMissing($announcement);
    }
}
