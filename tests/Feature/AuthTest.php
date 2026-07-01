<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

beforeEach(function () {
    $this->department = Departments::firstOrCreate(['department_name' => 'IT Department']);
    $this->role = Roles::firstOrCreate(['role_name' => 'Manager'], ['description' => 'Manager Role']);
});

test('can fetch roles', function () {
    $response = getJson('/api/roles');
    $response->assertStatus(200);
    $response->assertJsonStructure([
        'message',
        'roles' => [
            '*' => ['id', 'role_name', 'description']
        ]
    ]);
});

test('can fetch departments', function () {
    $response = getJson('/api/departments');
    $response->assertStatus(200);
    $response->assertJsonStructure([
        'message',
        'departments' => [
            '*' => ['id', 'department_name']
        ]
    ]);
});

test('can register a new user', function () {
    $payload = [
        'name' => 'New Test User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ];

    $response = postJson('/api/auth/register', $payload);
    $response->assertStatus(201);
    $response->assertJsonStructure([
        'message',
        'user' => ['id', 'name', 'email', 'department_id', 'role_id'],
        'token'
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'newuser@example.com',
        'name' => 'New Test User'
    ]);
});

test('registration fails with validation errors', function () {
    $payload = [
        'name' => '',
        'email' => 'invalidemail',
        'password' => 'short',
        'password_confirmation' => 'mismatch',
        'department_id' => 9999, // non-existent
        'role_id' => 9999, // non-existent
    ];

    $response = postJson('/api/auth/register', $payload);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'email', 'password', 'department_id', 'role_id']);
});

test('cannot fetch users list if unauthenticated', function () {
    $response = getJson('/api/auth/users');
    $response->assertStatus(401);
});

test('can fetch users list if authenticated', function () {
    $user = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/users');
    $response->assertStatus(200);
    $response->assertJsonStructure([
        'message',
        'users' => [
            '*' => [
                'id',
                'name',
                'email',
                'department_id',
                'role_id',
                'role' => ['id', 'role_name'],
                'department' => ['id', 'department_name']
            ]
        ]
    ]);
});
