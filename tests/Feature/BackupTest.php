<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->department = Departments::firstOrCreate([
        'department_name' => 'IT Department',
    ], [
        'dep_code' => 'IT',
        'dep_head' => 'Admin User',
        'email' => 'it@lams.gov.lk',
        'phone' => '+94 11 890 1234',
        'staff' => 3,
        'status' => true,
    ]);

    $this->adminRole = Roles::firstOrCreate(['role_name' => 'Admin'], ['description' => 'Administrator Role']);
    $this->managerRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer Role']);

    $this->adminUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->adminRole->id,
    ]);

    $this->regularUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->managerRole->id,
    ]);

    // Clean up backup directory before each test
    $backupDir = storage_path('app/backups');
    if (File::exists($backupDir)) {
        File::cleanDirectory($backupDir);
    }
});

test('admin can create backup', function () {
    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/backups');

    $response->assertStatus(201);
    $response->assertJsonStructure(['message', 'filename']);

    $filename = $response->json('filename');
    $this->assertFileExists(storage_path("app/backups/{$filename}"));
});

test('admin can list backups', function () {
    // Create a dummy backup file
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }
    File::put($backupDir.'/backup_test_123.zip', 'dummy content');

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/backups');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'message',
        'backups' => [
            '*' => ['filename', 'size', 'created_at'],
        ],
    ]);

    $this->assertCount(1, $response->json('backups'));
    $this->assertEquals('backup_test_123.zip', $response->json('backups.0.filename'));
});

test('admin can download backup', function () {
    // Create a dummy backup file
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }
    File::put($backupDir.'/backup_download_test.zip', 'dummy zip contents');

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/backups/backup_download_test.zip');

    $response->assertStatus(200);
    $this->assertEquals('dummy zip contents', $response->streamedContent());
});

test('admin can delete backup', function () {
    // Create a dummy backup file
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }
    File::put($backupDir.'/backup_delete_test.zip', 'dummy contents');

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->deleteJson('/api/backups/backup_delete_test.zip');

    $response->assertStatus(200);
    $this->assertFileDoesNotExist(storage_path('app/backups/backup_delete_test.zip'));
});

test('admin can clear cache', function () {
    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/clear-cache');

    $response->assertStatus(200);
    $response->assertJsonStructure(['message']);
});

test('non-admin user is forbidden from backup actions', function () {
    // List backups
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->getJson('/api/backups');
    $response->assertStatus(403);

    // Create backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->postJson('/api/backups');
    $response->assertStatus(403);

    // Download backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->getJson('/api/backups/backup_some_file.zip');
    $response->assertStatus(403);

    // Delete backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->deleteJson('/api/backups/backup_some_file.zip');
    $response->assertStatus(403);

    // Clear cache
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->postJson('/api/clear-cache');
    $response->assertStatus(403);
});
