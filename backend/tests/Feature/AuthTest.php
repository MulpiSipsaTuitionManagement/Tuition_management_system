<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::create([
            'username' => 'testuser',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'is_active' => true
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'testuser',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'token',
                     'user' => ['user_id', 'username', 'role']
                 ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        User::create([
            'username' => 'testuser',
            'password' => bcrypt('password123'),
            'role' => 'admin'
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'testuser',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                 ->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_get_profile()
    {
        $password = 'password123';
        $user = User::factory()->create([
            'password' => bcrypt($password),
            'is_active' => true
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => $password
        ]);
        $token = $loginResponse->json('token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/auth/me');

        $response->assertStatus(200)
                 ->assertJsonPath('user.username', $user->username);
    }

    public function test_user_can_logout()
    {
        $password = 'password123';
        $user = User::factory()->create([
            'password' => bcrypt($password),
            'is_active' => true
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => $password
        ]);
        $token = $loginResponse->json('token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/auth/logout');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }
}
