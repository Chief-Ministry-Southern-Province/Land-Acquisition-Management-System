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
    $this->role = Roles::create(['role_name' => 'DO', 'description' => 'DO Role']);

    $user = new User;
    $user->name = 'Admin User';
    $user->email = 'admin@test.com';
    $user->password = bcrypt('password');
    $user->department_id = $this->department->id;
    $user->role_id = $this->role->id;
    $user->save();

    $this->user = $user;
});

test('can download excel import template for land parcels', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/land-parcels/template?format=excel');

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('can download csv import template for land parcels', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/land-parcels/template?format=csv');

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
