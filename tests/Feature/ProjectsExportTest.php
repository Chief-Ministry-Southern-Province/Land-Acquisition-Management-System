<?php

use App\Models\Departments;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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

    Projects::create([
        'project_id' => 'PRJ-101',
        'title' => 'Test Project',
        'purpose' => 'Test Purpose',
        'institution' => 'Test Ministry',
        'institution_address' => 'Test Address',
        'land_area_to_be_acquired_acers' => 2.5,
        'land_area_to_be_acquired_roods' => 1.0,
        'land_area_to_be_acquired_perches' => 20.0,
        'full_land_area_to_be_acquired' => 420.0,
        'are_residents_moved_temp' => true,
        'case_status' => 'draft',
    ]);
});

test('can export projects as csv', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/projects/export?format=csv');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('can export projects as excel', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/projects/export?format=excel');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('can export projects as pdf', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/projects/export?format=pdf');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('can export projects as pdf in sinhala', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/projects/export?format=pdf&locale=si');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('can export single project as pdf', function () {
    $project = Projects::where('project_id', 'PRJ-101')->first();
    $response = $this->actingAs($this->user, 'sanctum')
        ->get("/api/projects/export?format=pdf&id={$project->id}");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('can export single project as pdf in sinhala', function () {
    $project = Projects::where('project_id', 'PRJ-101')->first();
    $response = $this->actingAs($this->user, 'sanctum')
        ->get("/api/projects/export?format=pdf&id={$project->id}&locale=si");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});
