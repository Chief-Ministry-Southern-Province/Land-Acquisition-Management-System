<?php

use App\Models\Departments;
use App\Models\LandParcel;
use App\Models\Projects;
use App\Models\PropertyOwner;
use App\Models\Roles;
use App\Models\User;

use function Pest\Laravel\deleteJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

beforeEach(function () {
    $this->department = Departments::create(['department_name' => 'IT Department']);
    $this->role = Roles::create(['role_name' => 'Manager', 'description' => 'Manager Role']);

    $user = new User;
    $user->name = 'Manager User';
    $user->email = 'manager@test.com';
    $user->password = bcrypt('password');
    $user->department_id = $this->department->id;
    $user->role_id = $this->role->id;
    $user->save();

    $this->user = $user;
});

test('projects crud operations', function () {
    $projectData = [
        'project_id' => 'PRJ-100',
        'name' => 'Test Project Name',
        'ministry' => 'Ministry of Lands',
        'department' => 'Acquisition Department',
        'project_type' => 'Infrastructure',
        'acquisition_act' => 'Act 2026',
        'district' => 'Galle',
        'division' => 'Four Gravets',
        'purpose' => 'Highway Expansion',
        'start_date' => '2026-01-01',
        'estimated_completion' => '2027-12-31',
        'budget_im_mn' => 123.45,
        'status' => 'pending',
        'project_manager' => 'John Doe',
        'contact' => '+94771234567',
        'email' => 'manager@lands.gov',
        'remarks' => 'Urgent priority',
    ];

    // Create
    $response = postJson('/api/projects', $projectData);
    $response->assertStatus(201);
    $response->assertJsonPath('project.project_id', 'PRJ-100');
    $projectId = $response->json('project.id');

    // Get All
    $response = getJson('/api/projects');
    $response->assertStatus(200);
    $response->assertJsonFragment(['project_id' => 'PRJ-100']);

    // Get One
    $response = getJson("/api/projects/{$projectId}");
    $response->assertStatus(200);
    $response->assertJsonPath('project.project_id', 'PRJ-100');

    // Update
    $projectData['name'] = 'Updated Project Name';
    $response = putJson("/api/projects/{$projectId}", $projectData);
    $response->assertStatus(200);
    $response->assertJsonPath('project.name', 'Updated Project Name');

    // Delete
    $response = deleteJson("/api/projects/{$projectId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = getJson("/api/projects/{$projectId}");
    $response->assertStatus(404);
});

test('land parcels crud operations', function () {
    $project = Projects::create([
        'project_id' => 'PRJ-200',
        'name' => 'Project 2',
        'ministry' => 'Ministry of Lands',
        'department' => 'Acquisition Department',
        'project_type' => 'Infrastructure',
        'acquisition_act' => 'Act 2026',
        'district' => 'Galle',
        'division' => 'Four Gravets',
        'purpose' => 'Highway Expansion',
        'start_date' => '2026-01-01',
        'estimated_completion' => '2027-12-31',
        'budget_im_mn' => 123.45,
        'status' => 'pending',
        'project_manager' => 'John Doe',
        'contact' => '+94771234567',
        'email' => 'manager@lands.gov',
    ]);

    $parcelData = [
        'parcel_id' => 'PAR-999',
        'project_id' => $project->id,
        'lot_no' => 'Lot 5B',
        'district' => 'Galle',
        'division' => 'Bope-Poddala',
        'village' => 'Pinnaduwa',
        'extent_acers' => 1.5,
        'extent_perches' => 20.0,
        'remarks' => 'Requires survey',
        'status' => 'available',
    ];

    // Create
    $response = postJson('/api/land-parcels', $parcelData);
    $response->assertStatus(201);
    $response->assertJsonPath('land_parcel.parcel_id', 'PAR-999');
    $parcelId = $response->json('land_parcel.id');

    // Get All
    $response = getJson('/api/land-parcels');
    $response->assertStatus(200);
    $response->assertJsonFragment(['parcel_id' => 'PAR-999']);

    // Get One
    $response = getJson("/api/land-parcels/{$parcelId}");
    $response->assertStatus(200);
    $response->assertJsonPath('land_parcel.parcel_id', 'PAR-999');

    // Update
    $parcelData['lot_no'] = 'Lot 5C';
    $response = putJson("/api/land-parcels/{$parcelId}", $parcelData);
    $response->assertStatus(200);
    $response->assertJsonPath('land_parcel.lot_no', 'Lot 5C');

    // Delete
    $response = deleteJson("/api/land-parcels/{$parcelId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = getJson("/api/land-parcels/{$parcelId}");
    $response->assertStatus(404);
});

test('property owners crud operations', function () {
    $ownerData = [
        'owner_id' => 'OWN-001',
        'name' => 'Wimal Perera',
        'nic' => '198012345678',
        'address' => '123 Main St, Galle',
        'contact' => '+94777777777',
    ];

    // Create
    $response = postJson('/api/property-owners', $ownerData);
    $response->assertStatus(201);
    $response->assertJsonPath('property_owner.owner_id', 'OWN-001');
    $ownerId = $response->json('property_owner.id');

    // Get All
    $response = getJson('/api/property-owners');
    $response->assertStatus(200);
    $response->assertJsonFragment(['owner_id' => 'OWN-001']);

    // Get One
    $response = getJson("/api/property-owners/{$ownerId}");
    $response->assertStatus(200);
    $response->assertJsonPath('property_owner.owner_id', 'OWN-001');

    // Update
    $ownerData['name'] = 'Wimal Siripala';
    $response = putJson("/api/property-owners/{$ownerId}", $ownerData);
    $response->assertStatus(200);
    $response->assertJsonPath('property_owner.name', 'Wimal Siripala');

    // Delete
    $response = deleteJson("/api/property-owners/{$ownerId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = getJson("/api/property-owners/{$ownerId}");
    $response->assertStatus(404);
});

test('compensation crud operations', function () {
    $owner = PropertyOwner::create([
        'owner_id' => 'OWN-002',
        'name' => 'Nimal Silva',
        'nic' => '199012345678',
        'address' => '456 Galle Rd',
        'contact' => '+94711223344',
    ]);
    $parcel = LandParcel::create([
        'parcel_id' => 'PAR-777',
        'lot_no' => 'Lot 2',
        'district' => 'Galle',
        'division' => 'Four Gravets',
        'village' => 'Karapitiya',
        'extent_acers' => 0.5,
        'extent_perches' => 10.0,
        'status' => 'pending',
    ]);

    $compData = [
        'owner_id' => $owner->id,
        'land_parcel_id' => $parcel->id,
        'compensation_id' => 'COM-999',
        'amount' => 500000.00,
        'approved_date' => '2026-05-01',
        'payment_date' => '2026-06-01',
        'status' => 'paid',
    ];

    // Create
    $response = postJson('/api/compensation', $compData);
    $response->assertStatus(201);
    $response->assertJsonPath('compensation.compensation_id', 'COM-999');
    $compId = $response->json('compensation.id');

    // Get All
    $response = getJson('/api/compensation');
    $response->assertStatus(200);
    $response->assertJsonFragment(['compensation_id' => 'COM-999']);

    // Get One
    $response = getJson("/api/compensation/{$compId}");
    $response->assertStatus(200);
    $response->assertJsonPath('compensation.compensation_id', 'COM-999');

    // Update
    $compData['amount'] = 600000.00;
    $response = putJson("/api/compensation/{$compId}", $compData);
    $response->assertStatus(200);
    expect((float) $response->json('compensation.amount'))->toEqual(600000.00);

    // Delete
    $response = deleteJson("/api/compensation/{$compId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = getJson("/api/compensation/{$compId}");
    $response->assertStatus(404);
});

test('documents crud operations', function () {
    $docData = [
        'user_id' => $this->user->id,
        'name' => 'Deed of Land',
        'type' => '.pdf',
        'category' => 'Legal',
        'size' => '2.4MB',
        'upload_date' => '2026-06-24',
        'document_type' => 'parcel',
        'link' => 'https://storage.provider.com/deed.pdf',
    ];

    // Create
    $response = postJson('/api/documents', $docData);
    $response->assertStatus(201);
    $response->assertJsonPath('document.name', 'Deed of Land');
    $docId = $response->json('document.id');

    // Get All
    $response = getJson('/api/documents');
    $response->assertStatus(200);
    $response->assertJsonFragment(['name' => 'Deed of Land']);

    // Get One
    $response = getJson("/api/documents/{$docId}");
    $response->assertStatus(200);
    $response->assertJsonPath('document.name', 'Deed of Land');

    // Update
    $docData['name'] = 'Deed of Land Updated';
    $response = putJson("/api/documents/{$docId}", $docData);
    $response->assertStatus(200);
    $response->assertJsonPath('document.name', 'Deed of Land Updated');

    // Delete
    $response = deleteJson("/api/documents/{$docId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = getJson("/api/documents/{$docId}");
    $response->assertStatus(404);
});

test('audit logs crud operations', function () {
    $logData = [
        'user_id' => $this->user->id,
        'action' => 'Create Land Parcel',
        'detail' => 'Created land parcel PAR-999 successfully',
    ];

    // Create
    $response = postJson('/api/audit-logs', $logData);
    $response->assertStatus(201);
    $response->assertJsonPath('audit_log.action', 'Create Land Parcel');
    $logId = $response->json('audit_log.id');

    // Get All
    $response = getJson('/api/audit-logs');
    $response->assertStatus(200);
    $response->assertJsonFragment(['action' => 'Create Land Parcel']);

    // Get One
    $response = getJson("/api/audit-logs/{$logId}");
    $response->assertStatus(200);
    $response->assertJsonPath('audit_log.action', 'Create Land Parcel');

    // Update
    $logData['detail'] = 'Updated detail info';
    $response = putJson("/api/audit-logs/{$logId}", $logData);
    $response->assertStatus(200);
    $response->assertJsonPath('audit_log.detail', 'Updated detail info');

    // Delete
    $response = deleteJson("/api/audit-logs/{$logId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = getJson("/api/audit-logs/{$logId}");
    $response->assertStatus(404);
});
