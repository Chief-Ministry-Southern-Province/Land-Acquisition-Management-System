<?php

use App\Models\Backup;
use App\Models\Departments;
use App\Models\Roles;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;
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

    $backupDir = storage_path('app/backups');
    if (File::exists($backupDir)) {
        File::cleanDirectory($backupDir);
    }
});

test('admin can get system settings with defaults', function () {
    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/settings');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'settings' => [
            'auto_backup',
            'backup_frequency',
            'retention_days',
            'audit_log_retention',
        ],
    ]);

    $this->assertTrue($response->json('settings.auto_backup'));
    $this->assertEquals('daily', $response->json('settings.backup_frequency'));
    $this->assertEquals(30, $response->json('settings.retention_days'));
});

test('admin can update backup settings and retention', function () {
    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/settings', [
            'auto_backup' => false,
            'backup_frequency' => 'weekly',
            'retention_days' => 14,
            'audit_log_retention' => 180,
        ]);

    $response->assertStatus(200);
    $response->assertJson([
        'message' => 'System settings updated successfully',
        'settings' => [
            'auto_backup' => false,
            'backup_frequency' => 'weekly',
            'retention_days' => 14,
            'audit_log_retention' => 180,
        ],
    ]);

    $this->assertFalse(SystemSetting::get('auto_backup'));
    $this->assertEquals('weekly', SystemSetting::get('backup_frequency'));
    $this->assertEquals(14, SystemSetting::get('retention_days'));
});

test('admin can update smtp_port as integer or string without validation errors', function () {
    $origPort = SystemSetting::getEnvValue('MAIL_PORT', '587');

    try {
        // 1. Sent as integer
        $resInt = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/settings', [
                'smtp_port' => 587,
            ]);
        $resInt->assertStatus(200);
        $this->assertEquals('587', SystemSetting::get('smtp_port'));

        // 2. Sent as string
        $resStr = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/settings', [
                'smtp_port' => '465',
            ]);
        $resStr->assertStatus(200);
        $this->assertEquals('465', SystemSetting::get('smtp_port'));
    } finally {
        SystemSetting::updateEnv(['MAIL_PORT' => $origPort]);
        config(['mail.mailers.smtp.port' => (int) $origPort]);
    }
});

test('smtp host and port are read from env and updating changes env and settings', function () {
    $origHost = SystemSetting::getEnvValue('MAIL_HOST', 'smtp.gmail.com');
    $origPort = SystemSetting::getEnvValue('MAIL_PORT', '587');

    try {
        $getRes = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/settings');
        $getRes->assertStatus(200);
        $this->assertEquals($origHost, $getRes->json('settings.smtp_host'));
        $this->assertEquals((string) $origPort, (string) $getRes->json('settings.smtp_port'));

        $postRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/settings', [
                'smtp_host' => 'smtp.custom-mail.gov.lk',
                'smtp_port' => '2525',
            ]);
        $postRes->assertStatus(200);
        $this->assertEquals('smtp.custom-mail.gov.lk', $postRes->json('settings.smtp_host'));
        $this->assertEquals('2525', $postRes->json('settings.smtp_port'));

        $this->assertEquals('smtp.custom-mail.gov.lk', SystemSetting::getEnvValue('MAIL_HOST'));
        $this->assertEquals('2525', SystemSetting::getEnvValue('MAIL_PORT'));
        $this->assertEquals('smtp.custom-mail.gov.lk', SystemSetting::get('smtp_host'));
        $this->assertEquals('2525', SystemSetting::get('smtp_port'));
    } finally {
        SystemSetting::updateEnv([
            'MAIL_HOST' => $origHost,
            'MAIL_PORT' => $origPort,
        ]);
        config([
            'mail.mailers.smtp.host' => $origHost,
            'mail.mailers.smtp.port' => (int) $origPort,
        ]);
    }
});

test('non-admin is forbidden from system settings', function () {
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->getJson('/api/settings');
    $response->assertStatus(403);

    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->postJson('/api/settings', ['auto_backup' => true]);
    $response->assertStatus(403);
});

test('lams:clean-backups deletes files older than retention period', function () {
    $backupDir = storage_path('app/backups');
    if (! File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true);
    }

    // Set retention to 10 days
    SystemSetting::set('retention_days', 10);

    // Old backup (15 days old)
    $oldFilename = 'backup_db_old.zip';
    File::put($backupDir.'/'.$oldFilename, 'old backup');
    $oldBackup = Backup::create([
        'filename' => $oldFilename,
        'backup_type' => 'database',
        'file_size' => '10 B',
        'user_id' => $this->adminUser->id,
    ]);
    $oldBackup->created_at = Carbon::now()->subDays(15);
    $oldBackup->save();

    // Fresh backup (2 days old)
    $freshFilename = 'backup_db_fresh.zip';
    File::put($backupDir.'/'.$freshFilename, 'fresh backup');
    $freshBackup = Backup::create([
        'filename' => $freshFilename,
        'backup_type' => 'database',
        'file_size' => '12 B',
        'user_id' => $this->adminUser->id,
    ]);
    $freshBackup->created_at = Carbon::now()->subDays(2);
    $freshBackup->save();

    // Run clean command
    $this->artisan('lams:clean-backups')
        ->assertExitCode(0);

    // Verify old backup is deleted
    $this->assertFileDoesNotExist($backupDir.'/'.$oldFilename);
    $this->assertDatabaseMissing('backups', ['filename' => $oldFilename]);

    // Verify fresh backup is preserved
    $this->assertFileExists($backupDir.'/'.$freshFilename);
    $this->assertDatabaseHas('backups', ['filename' => $freshFilename]);
});

test('lams:run-backup respects auto_backup setting and frequency', function () {
    // Disable auto-backup
    SystemSetting::set('auto_backup', false);

    $this->artisan('lams:run-backup')
        ->expectsOutputToContain('Automatic backups are disabled')
        ->assertExitCode(0);

    // Re-enable auto-backup
    SystemSetting::set('auto_backup', true);
    SystemSetting::set('backup_frequency', 'daily');

    // Run with force flag
    $this->artisan('lams:run-backup', ['--force' => true])
        ->expectsOutputToContain('Database backup created successfully')
        ->assertExitCode(0);

    $this->assertNotNull(SystemSetting::get('last_auto_backup_at'));

    // Running immediately after without force should skip because it is daily
    $this->artisan('lams:run-backup')
        ->expectsOutputToContain('Automatic backup is not due yet')
        ->assertExitCode(0);
});

test('admin can update sms_notifs notification channel setting', function () {
    // Check default
    $resDefault = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/settings');
    $resDefault->assertStatus(200);
    $this->assertTrue($resDefault->json('settings.sms_notifs'));

    // Disable SMS notifications
    $resUpdate = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/settings', [
            'sms_notifs' => false,
        ]);
    $resUpdate->assertStatus(200);
    $this->assertFalse($resUpdate->json('settings.sms_notifs'));
    $this->assertFalse(SystemSetting::get('sms_notifs'));

    // Verify SmsService skips when disabled
    Config::set('sms.enabled', true);
    Config::set('sms.default', 'log');
    $result = SmsService::sendSms('+94771234567', 'Test Notification');
    $this->assertFalse($result);

    // Re-enable SMS notifications
    $resUpdate2 = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/settings', [
            'sms_notifs' => true,
        ]);
    $resUpdate2->assertStatus(200);
    $this->assertTrue($resUpdate2->json('settings.sms_notifs'));
    $this->assertTrue(SystemSetting::get('sms_notifs'));
});
