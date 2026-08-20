<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;

beforeEach(function () {
    $this->department = Departments::create([
        'department_name' => 'IT Department',
        'dep_code' => 'IT',
        'dep_head' => 'Admin User',
        'email' => 'it@lams.gov.lk',
        'phone' => '+94 11 890 1234',
        'staff' => 3,
        'status' => true,
    ]);

    $this->role = Roles::create(['role_name' => 'Admin', 'description' => 'Admin Role']);

    $user = new User;
    $user->name = 'Admin User';
    $user->email = 'admin@test.com';
    $user->password = bcrypt('password');
    $user->department_id = $this->department->id;
    $user->role_id = $this->role->id;
    $user->save();

    $this->user = $user;
});

test('failed project creation logs in audit logs', function () {
    $doRole = Roles::create(['role_name' => 'DO', 'description' => 'DO Role']);
    $doUser = User::create([
        'name' => 'DO User',
        'email' => 'do_failed@test.com',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $doRole->id,
    ]);

    $response = $this->actingAs($doUser, 'sanctum')->postJson('/api/projects', [
        'project_id' => '', // triggers validation error
    ]);

    $response->assertStatus(422);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $doUser->id,
        'name' => $doUser->name,
        'action' => 'Create',
        'module' => 'Projects',
        'detail' => 'Failed to create project Unknown',
    ]);
});

test('failed department creation logs in audit logs', function () {
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/departments', [
        'department_name' => '', // triggers validation error
    ]);

    $response->assertStatus(422);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'name' => $this->user->name,
        'action' => 'Create',
        'module' => 'Departments',
        'detail' => 'Failed to create department Unknown',
    ]);
});

test('failed user registration by admin logs in audit logs', function () {
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/auth/register', [
        'name' => 'Failed User Name',
        'email' => 'invalidemail', // triggers validation error
    ]);

    $response->assertStatus(422);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'name' => $this->user->name,
        'action' => 'Register',
        'module' => 'Authentication',
        'detail' => 'Failed registration for user: Failed User Name',
    ]);
});
