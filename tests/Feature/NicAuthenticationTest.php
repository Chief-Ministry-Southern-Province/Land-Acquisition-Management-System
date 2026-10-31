<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;

beforeEach(function () {
    $this->department = Departments::create([
        'department_name' => 'NIC Test Department',
        'dep_code' => 'NIC',
        'dep_head' => 'Test Head',
        'email' => 'nic-department@example.com',
        'phone' => '0771234567',
        'staff' => 1,
        'status' => true,
    ]);
    $this->role = Roles::create([
        'role_name' => 'NIC_TEST',
        'description' => 'NIC Test Role',
    ]);
});

test('a user can log in with an email address', function () {
    $user = User::factory()->create([
        'email' => 'officer@example.com',
        'nic' => '200135801709',
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);

    $this->postJson('/api/auth/login', [
        'login' => $user->email,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('user.id', $user->id);
});

test('a user can log in with an nic number regardless of suffix case', function () {
    $user = User::factory()->create([
        'nic' => '683250619V',
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);

    $this->postJson('/api/auth/login', [
        'login' => '683250619v',
        'password' => 'password',
    ])->assertOk()->assertJsonPath('user.id', $user->id);
});

test('profile accepts valid nic formats and normalizes the suffix', function (string $nic, string $storedNic) {
    $user = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);

    $this->actingAs($user, 'sanctum')->putJson('/api/auth/profile', [
        'name' => $user->name,
        'email' => $user->email,
        'nic' => $nic,
    ])->assertOk()->assertJsonPath('user.nic', $storedNic);

    expect($user->fresh()->nic)->toBe($storedNic);
})->with([
    'new NIC format' => ['200135801709', '200135801709'],
    'old NIC with uppercase V' => ['683250619V', '683250619V'],
    'old NIC with lowercase v' => ['683250619v', '683250619V'],
    'old NIC with uppercase X' => ['683250619X', '683250619X'],
    'old NIC with lowercase x' => ['683250619x', '683250619X'],
]);

test('profile rejects an invalid nic format', function (string $nic) {
    $user = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);

    $this->actingAs($user, 'sanctum')->putJson('/api/auth/profile', [
        'name' => $user->name,
        'email' => $user->email,
        'nic' => $nic,
    ])->assertUnprocessable()->assertJsonValidationErrors('nic');
})->with([
    'invalid suffix' => ['1234617869s'],
    'nine digits with unsupported suffix' => ['683250619s'],
    'nine digits without suffix' => ['683250619'],
    'ten digits' => ['6832506190'],
    'eleven digits' => ['20013580170'],
    'thirteen digits' => ['2001358017091'],
    'eight digits with V' => ['68325061V'],
    'ten digits with X' => ['6832506190X'],
    'letters among twelve characters' => ['20013580A709'],
]);

test('nic numbers must be unique', function () {
    User::factory()->create([
        'nic' => '683250619V',
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);
    $user = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->role->id,
    ]);

    $this->actingAs($user, 'sanctum')->putJson('/api/auth/profile', [
        'name' => $user->name,
        'email' => $user->email,
        'nic' => '683250619v',
    ])->assertUnprocessable()->assertJsonValidationErrors('nic');
});
