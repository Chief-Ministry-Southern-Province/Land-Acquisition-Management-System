<?php

use App\Models\AuditLogs;
use App\Models\Departments;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;

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
    $this->doRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer Role']);

    $this->adminUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->adminRole->id,
    ]);

    $this->regularUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
    ]);
});

test('admin can fetch admin dashboard stats', function () {
    AuditLogs::create([
        'user_id' => $this->adminUser->id,
        'action' => 'LOGIN',
        'module' => 'Auth',
        'detail' => 'User logged in',
        'ip_address' => '127.0.0.1',
    ]);

    Projects::create([
        'project_id' => 'PRJ-TEST-001',
        'title' => 'Test Project',
        'purpose' => 'Testing',
        'institution' => 'Test Inst',
        'case_status' => 'pending',
    ]);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/admin/stats');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'stats' => [
                'active_users',
                'active_users_change',
                'system_logs_24h',
                'logs_rate',
                'pending_requests',
                'pending_requests_change',
            ],
        ]);

    $data = $response->json('stats');
    $this->assertGreaterThanOrEqual(2, $data['active_users']);
    $this->assertGreaterThanOrEqual(1, $data['system_logs_24h']);
    $this->assertGreaterThanOrEqual(1, $data['pending_requests']);
});

test('non-admin cannot fetch admin dashboard stats', function () {
    $response = $this->actingAs($this->regularUser, 'sanctum')
        ->getJson('/api/admin/stats');

    $response->assertStatus(403);
});

test('unauthenticated user cannot fetch admin dashboard stats', function () {
    $response = $this->getJson('/api/admin/stats');

    $response->assertStatus(401);
});
