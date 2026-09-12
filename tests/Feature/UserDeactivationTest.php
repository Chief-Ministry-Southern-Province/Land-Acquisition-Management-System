<?php

use App\Models\Departments;
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
    $this->userRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer']);

    $this->adminUser = User::factory()->create([
        'name' => 'Admin User',
        'email' => 'admin@test.com',
        'department_id' => $this->department->id,
        'role_id' => $this->adminRole->id,
        'status' => 'active',
    ]);

    $this->targetUser = User::factory()->create([
        'name' => 'Target User',
        'email' => 'target@test.com',
        'department_id' => $this->department->id,
        'role_id' => $this->userRole->id,
        'status' => 'active',
    ]);
});

test('admin can deactivate a user via api', function () {
    $payload = [
        'name' => 'Target User',
        'email' => 'target@test.com',
        'department_id' => $this->department->id,
        'role_id' => $this->userRole->id,
        'status' => 'inactive',
    ];

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->putJson("/api/users/{$this->targetUser->id}", $payload);

    $response->assertStatus(200);
    $response->assertJsonPath('user.status', 'inactive');

    $this->assertDatabaseHas('users', [
        'id' => $this->targetUser->id,
        'status' => 'inactive',
    ]);
});

test('deactivated user cannot log in', function () {
    $this->targetUser->update(['status' => 'inactive']);

    $loginPayload = [
        'email' => 'target@test.com',
        'password' => 'password',
    ];

    $response = $this->postJson('/api/auth/login', $loginPayload);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('deactivated user token is revoked and access is blocked', function () {
    // Create token for target user
    $token = $this->targetUser->createToken('auth_token')->plainTextToken;

    // Deactivate user
    $this->targetUser->update(['status' => 'inactive']);

    // Attempt request using the bearer token
    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/notifications');

    $response->assertStatus(403);
    $response->assertJsonPath('message', 'Your account has been deactivated. Please contact an administrator.');
});

test('deactivating user revokes all active tokens', function () {
    $this->targetUser->createToken('token_1');
    $this->targetUser->createToken('token_2');

    expect($this->targetUser->tokens()->count())->toBe(2);

    $payload = [
        'name' => 'Target User',
        'email' => 'target@test.com',
        'department_id' => $this->department->id,
        'role_id' => $this->userRole->id,
        'status' => 'inactive',
    ];

    $this->actingAs($this->adminUser, 'sanctum')
        ->putJson("/api/users/{$this->targetUser->id}", $payload);

    expect($this->targetUser->fresh()->tokens()->count())->toBe(0);
});

test('admin stats active users metric excludes deactivated users', function () {
    $responseBefore = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/admin/stats');
    $responseBefore->assertStatus(200);
    $initialActiveCount = $responseBefore->json('stats.active_users');

    // Deactivate target user
    $this->targetUser->update(['status' => 'inactive']);

    $responseAfter = $this->actingAs($this->adminUser, 'sanctum')
        ->getJson('/api/admin/stats');
    $responseAfter->assertStatus(200);
    $updatedActiveCount = $responseAfter->json('stats.active_users');

    expect($updatedActiveCount)->toBe($initialActiveCount - 1);
});

test('delete user physically deletes account', function () {
    $this->targetUser->createToken('active_token');
    expect($this->targetUser->tokens()->count())->toBe(1);

    $response = $this->actingAs($this->adminUser, 'sanctum')
        ->deleteJson("/api/users/{$this->targetUser->id}");

    $response->assertStatus(200);

    $this->assertDatabaseMissing('users', [
        'id' => $this->targetUser->id,
    ]);
});
