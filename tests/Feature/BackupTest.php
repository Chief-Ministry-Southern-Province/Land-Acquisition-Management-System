<?php

use App\Models\Backup;
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
    $this->assertStringStartsWith('backup_db_', $filename);

    $this->assertDatabaseHas('backups', [
        'filename' => $filename,
        'backup_type' => 'database',
        'user_id' => $this->adminUser->id,
    ]);
});

test('admin can create files backup', function () {
    // Create a dummy uploaded file to be backed up
    $uploadsDir = storage_path('app/acquisition_case_documents');
    if (! File::exists($uploadsDir)) {
        File::makeDirectory($uploadsDir, 0755, true);
    }
    File::put($uploadsDir.'/test_file.txt', 'file contents');

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/backups/files');

    $response->assertStatus(201);
    $response->assertJsonStructure(['message', 'filename']);

    $filename = $response->json('filename');
    $this->assertFileExists(storage_path("app/backups/{$filename}"));
    $this->assertStringStartsWith('backup_files_', $filename);

    $this->assertDatabaseHas('backups', [
        'filename' => $filename,
        'backup_type' => 'files',
        'user_id' => $this->adminUser->id,
    ]);
});

test('admin can list backups', function () {
    // Create a dummy backup file
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }

    $filename = 'backup_db_test_123.zip';
    File::put($backupDir.'/'.$filename, 'dummy content');

    Backup::create([
        'filename' => $filename,
        'backup_type' => 'database',
        'file_size' => '10 B',
        'user_id' => $this->adminUser->id,
    ]);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/backups');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'message',
        'backups' => [
            '*' => ['filename', 'size', 'created_at', 'type'],
        ],
    ]);

    $this->assertCount(1, $response->json('backups'));
    $this->assertEquals($filename, $response->json('backups.0.filename'));
});

test('admin can download backup', function () {
    // Create a dummy backup file
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }

    $filename = 'backup_db_download_test.zip';
    File::put($backupDir.'/'.$filename, 'dummy zip contents');

    Backup::create([
        'filename' => $filename,
        'backup_type' => 'database',
        'file_size' => '18 B',
        'user_id' => $this->adminUser->id,
    ]);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/backups/'.$filename);

    $response->assertStatus(200);
    $this->assertEquals('dummy zip contents', $response->streamedContent());
});

test('admin can delete backup', function () {
    // Create a dummy backup file
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }

    $filename = 'backup_db_delete_test.zip';
    File::put($backupDir.'/'.$filename, 'dummy contents');

    Backup::create([
        'filename' => $filename,
        'backup_type' => 'database',
        'file_size' => '14 B',
        'user_id' => $this->adminUser->id,
    ]);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->deleteJson('/api/backups/'.$filename);

    $response->assertStatus(200);
    $this->assertFileDoesNotExist(storage_path('app/backups/'.$filename));

    $this->assertDatabaseMissing('backups', [
        'filename' => $filename,
    ]);
});

test('admin can clear cache', function () {
    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/clear-cache');

    $response->assertStatus(200);
    $response->assertJsonStructure(['message']);
});

test('admin can restore database backup', function () {
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }

    $filename = 'backup_db_restore_test.sql';
    File::put($backupDir.'/'.$filename, '-- Database dump for testing restore');

    Backup::create([
        'filename' => $filename,
        'backup_type' => 'database',
        'file_size' => '36 B',
        'user_id' => $this->adminUser->id,
    ]);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson("/api/backups/{$filename}/restore");

    $response->assertStatus(200);
});

test('cannot restore files backup', function () {
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }

    $filename = 'backup_files_restore_test.zip';
    File::put($backupDir.'/'.$filename, 'dummy contents');

    Backup::create([
        'filename' => $filename,
        'backup_type' => 'files',
        'file_size' => '14 B',
        'user_id' => $this->adminUser->id,
    ]);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson("/api/backups/{$filename}/restore");

    $response->assertStatus(400);
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

    // Create files backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->postJson('/api/backups/files');
    $response->assertStatus(403);

    // Download backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->getJson('/api/backups/backup_some_file.zip');
    $response->assertStatus(403);

    // Delete backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->deleteJson('/api/backups/backup_some_file.zip');
    $response->assertStatus(403);

    // Restore backup
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->postJson('/api/backups/backup_some_file.zip/restore');
    $response->assertStatus(403);

    // Clear cache
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->postJson('/api/clear-cache');
    $response->assertStatus(403);
});
