<?php

use App\Models\Departments;
use App\Models\LandParcel;
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
    $this->role = Roles::create(['role_name' => 'DO', 'description' => 'DO Role']);

    $user = new User;
    $user->name = 'Admin User';
    $user->email = 'admin@test.com';
    $user->password = bcrypt('password');
    $user->department_id = $this->department->id;
    $user->role_id = $this->role->id;
    $user->save();

    $this->user = $user;

    $this->parcel = LandParcel::create([
        'parcel_id' => 'LND/2026/007',
        'land_name' => 'Test Land',
        'district' => 'Galle',
        'divisional_secretariat' => 'Four Gravets',
        'grama_niladari_division' => 'Galle Fort',
        'village' => 'Fort',
        'land_type' => 'Private',
        'land_size_acers' => 1,
        'land_size_roods' => 2,
        'land_size_perches' => 10,
        'status' => 'available',
    ]);
});

test('can export land parcels as csv', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/land-parcels/export?format=csv');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('can export land parcels as excel', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/land-parcels/export?format=excel');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('can export land parcels as pdf', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get('/api/land-parcels/export?format=pdf');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('can export land parcel as pdf when parcel_id contains slashes', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get("/api/land-parcels/export?format=pdf&id={$this->parcel->id}");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('can export land parcel as pdf in sinhala when parcel_id contains slashes', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->get("/api/land-parcels/export?format=pdf&id={$this->parcel->id}&locale=si");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});
