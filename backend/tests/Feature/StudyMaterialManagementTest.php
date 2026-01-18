<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Models\Tutor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Facades\JWTAuth;

class StudyMaterialManagementTest extends TestCase
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

    public function test_can_list_study_materials()
    {
        StudyMaterial::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/study-materials');

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);
    }

    public function test_can_upload_study_material()
    {
        Storage::fake('public');

        $subject = Subject::factory()->create();
        
        $payload = [
            'title' => 'Test Material',
            'description' => 'Test Description',
            'subject_id' => $subject->subject_id,
            'file' => UploadedFile::fake()->create('document.pdf', 500)
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/study-materials/upload', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('study_materials', ['title' => 'Test Material']);
        
        $material = StudyMaterial::first();
        Storage::disk('public')->assertExists($material->file_path);
    }

    public function test_can_delete_study_material()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('delete_me.pdf', 100);
        $path = $file->store('study_materials', 'public');

        $material = StudyMaterial::factory()->create([
            'file_path' => $path
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->deleteJson("/api/study-materials/{$material->material_id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('study_materials', ['material_id' => $material->material_id]);
        Storage::disk('public')->assertMissing($path);
    }
}
