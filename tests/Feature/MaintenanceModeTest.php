<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\SystemSetting;
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

    $this->doUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
    ]);

    // Ensure maintenance mode is off before each test
    SystemSetting::set('maintenance_mode', false);
});

test('non-admin can access system when maintenance mode is disabled', function () {
    $response = $this->actingAs($this->doUser, 'sanctum')
        ->get('/dashboard');

    $response->assertStatus(200);
});

test('admin can access system even when maintenance mode is active', function () {
    SystemSetting::set('maintenance_mode', true);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->get('/dashboard');

    $response->assertStatus(200);
});

test('non-admin is redirected to maintenance page when maintenance mode is active', function () {
    SystemSetting::set('maintenance_mode', true);

    $response = $this->actingAs($this->doUser, 'sanctum')
        ->get('/dashboard');

    $response->assertRedirect('/maintenance');
});

test('maintenance page renders successfully for non-admin during maintenance', function () {
    SystemSetting::set('maintenance_mode', true);

    $response = $this->actingAs($this->doUser, 'sanctum')
        ->get('/maintenance');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Maintenance')
        ->where('isAdmin', false)
        ->where('userRole', 'DO')
        ->where('isMaintenanceActive', true)
    );
});

test('admin visiting maintenance page sees admin bypass status', function () {
    SystemSetting::set('maintenance_mode', true);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->get('/maintenance');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Maintenance')
        ->where('isAdmin', true)
        ->where('isMaintenanceActive', true)
    );
});

test('non-admin receives 503 json on api calls when maintenance mode is active', function () {
    SystemSetting::set('maintenance_mode', true);

    $response = $this->actingAs($this->doUser, 'sanctum')
        ->getJson('/api/notifications');

    $response->assertStatus(503);
    $response->assertJson([
        'error' => 'maintenance_mode',
        'maintenance' => true,
    ]);
});

test('admin can access api endpoints and disable maintenance mode', function () {
    SystemSetting::set('maintenance_mode', true);

    // Admin can access settings
    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/settings');

    $response->assertStatus(200);

    // Admin turns off maintenance mode
    $updateResponse = $this->actingAs($this->adminUser, 'sanctum')
        ->postJson('/api/settings', [
            'maintenance_mode' => false,
        ]);

    $updateResponse->assertStatus(200);
    $this->assertFalse(SystemSetting::get('maintenance_mode'));

    // Non-admin can now access again
    $doResponse = $this->actingAs($this->doUser, 'sanctum')
        ->get('/dashboard');

    $doResponse->assertStatus(200);
});
