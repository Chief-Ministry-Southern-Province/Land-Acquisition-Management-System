<?php

use App\Models\Departments;
use App\Models\LandParcel;
use App\Models\Projects;
use App\Models\PropertyOwner;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

test('projects crud operations', function () {
    $projectData = [
        'project_id' => 'PRJ-100',
        'title' => 'Test Project Name',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Lands',
        'institution_address' => '123 Land Office, Galle',
        'land_area_to_be_acquired_acers' => 10.0,
        'land_area_to_be_acquired_roods' => 2.0,
        'land_area_to_be_acquired_perches' => 15.0,
        'full_land_area_to_be_acquired' => 1715.0,
        'are_residents_moved_temp' => false,
        'status' => 'pending',
        'remarks' => 'Urgent priority',
    ];

    // Create
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/projects', $projectData);
    $response->assertStatus(201);
    $response->assertJsonPath('project.project_id', 'PRJ-100');
    $projectId = $response->json('project.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Projects',
        'detail' => 'Created project Test Project Name',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/projects');
    $response->assertStatus(200);
    $response->assertJsonFragment(['project_id' => 'PRJ-100']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/projects/{$projectId}");
    $response->assertStatus(200);
    $response->assertJsonPath('project.project_id', 'PRJ-100');

    // Update
    $projectData['title'] = 'Updated Project Name';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/projects/{$projectId}", $projectData);
    $response->assertStatus(200);
    $response->assertJsonPath('project.title', 'Updated Project Name');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Projects',
        'detail' => 'Updated project Updated Project Name',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/projects/{$projectId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Projects',
        'detail' => 'Deleted project Updated Project Name',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/projects/{$projectId}");
    $response->assertStatus(404);
});

test('land parcels crud operations', function () {
    $project = Projects::create([
        'project_id' => 'PRJ-200',
        'title' => 'Project 2',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Lands',
        'institution_address' => 'Galle',
        'land_area_to_be_acquired_acers' => 5.0,
        'land_area_to_be_acquired_roods' => 0.0,
        'land_area_to_be_acquired_perches' => 0.0,
        'full_land_area_to_be_acquired' => 800.0,
        'are_residents_moved_temp' => false,
        'status' => 'pending',
    ]);

    $parcelData = [
        'parcel_id' => 'PAR-999',
        'project_id' => $project->id,
        'land_name' => 'Lot 5B Land',
        'province' => 'Southern',
        'district' => 'Galle',
        'divisional_secretariat' => 'Bope-Poddala',
        'grama_niladari_division' => 'Pinnaduwa North',
        'village' => 'Pinnaduwa',
        'land_size_acers' => 1.5,
        'land_size_roods' => 0.0,
        'land_size_perches' => 20.0,
        'full_land_size' => 260.0,
        'has_plan' => false,
        'has_residential_houses' => false,
        'is_resident_owner' => false,
        'cultivation' => 'Paddy',
        'cultivation_status' => 'fertile',
        'annual_income' => 50000.00,
        'land_type' => 'Private',
        'estimated_value' => 1500000.00,
        'remarks' => 'Requires survey',
        'status' => 'available',
    ];

    // Create
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/land-parcels', $parcelData);
    $response->assertStatus(201);
    $response->assertJsonPath('land_parcel.parcel_id', 'PAR-999');
    $parcelId = $response->json('land_parcel.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Land Parcels',
        'detail' => 'Created land parcel PAR-999',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/land-parcels');
    $response->assertStatus(200);
    $response->assertJsonFragment(['parcel_id' => 'PAR-999']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/land-parcels/{$parcelId}");
    $response->assertStatus(200);
    $response->assertJsonPath('land_parcel.parcel_id', 'PAR-999');

    // Update
    $parcelData['land_name'] = 'Lot 5C Land';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/land-parcels/{$parcelId}", $parcelData);
    $response->assertStatus(200);
    $response->assertJsonPath('land_parcel.land_name', 'Lot 5C Land');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Land Parcels',
        'detail' => 'Updated land parcel PAR-999',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/land-parcels/{$parcelId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Land Parcels',
        'detail' => 'Deleted land parcel PAR-999',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/land-parcels/{$parcelId}");
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
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/property-owners', $ownerData);
    $response->assertStatus(201);
    $response->assertJsonPath('property_owner.owner_id', 'OWN-001');
    $ownerId = $response->json('property_owner.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Property Owners',
        'detail' => 'Created property owner Wimal Perera',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/property-owners');
    $response->assertStatus(200);
    $response->assertJsonFragment(['owner_id' => 'OWN-001']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/property-owners/{$ownerId}");
    $response->assertStatus(200);
    $response->assertJsonPath('property_owner.owner_id', 'OWN-001');

    // Update
    $ownerData['name'] = 'Wimal Siripala';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/property-owners/{$ownerId}", $ownerData);
    $response->assertStatus(200);
    $response->assertJsonPath('property_owner.name', 'Wimal Siripala');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Property Owners',
        'detail' => 'Updated property owner Wimal Siripala',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/property-owners/{$ownerId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Property Owners',
        'detail' => 'Deleted property owner Wimal Siripala',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/property-owners/{$ownerId}");
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
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/compensation', $compData);
    $response->assertStatus(201);
    $response->assertJsonPath('compensation.compensation_id', 'COM-999');
    $compId = $response->json('compensation.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Compensation',
        'detail' => 'Created compensation COM-999',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/compensation');
    $response->assertStatus(200);
    $response->assertJsonFragment(['compensation_id' => 'COM-999']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/compensation/{$compId}");
    $response->assertStatus(200);
    $response->assertJsonPath('compensation.compensation_id', 'COM-999');

    // Update
    $compData['amount'] = 600000.00;
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/compensation/{$compId}", $compData);
    $response->assertStatus(200);
    expect((float) $response->json('compensation.amount'))->toEqual(600000.00);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Compensation',
        'detail' => 'Updated compensation COM-999',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/compensation/{$compId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Compensation',
        'detail' => 'Deleted compensation COM-999',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/compensation/{$compId}");
    $response->assertStatus(404);
});

test('documents crud operations', function () {
    $project = Projects::create([
        'project_id' => 'PRJ-100',
        'title' => 'Test Project Name',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Lands',
        'institution_address' => 'Acquisition Department',
        'land_area_to_be_acquired_acers' => 10.0,
        'land_area_to_be_acquired_roods' => 0.0,
        'land_area_to_be_acquired_perches' => 0.0,
        'full_land_area_to_be_acquired' => 1600.0,
        'are_residents_moved_temp' => false,
        'status' => 'pending',
        'remarks' => 'Urgent priority',
    ]);

    $docData = [
        'user_id' => $this->user->id,
        'project_id' => $project->id,
        'original_filename' => 'Deed of Land.pdf',
        'stored_filename' => 'stored_deed_of_land.pdf',
        'file_type' => '.pdf',
        'file_path' => 'uploads/docs/stored_deed_of_land.pdf',
        'file_size' => '2.4MB',
        'document_category' => 'Legal',
        'upload_date' => '2026-06-24',
    ];

    // Create
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/documents', $docData);
    $response->assertStatus(201);
    $response->assertJsonPath('document.original_filename', 'Deed of Land.pdf');
    $docId = $response->json('document.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Documents',
        'detail' => 'Created document Deed of Land.pdf',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/documents');
    $response->assertStatus(200);
    $response->assertJsonFragment(['original_filename' => 'Deed of Land.pdf']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/documents/{$docId}");
    $response->assertStatus(200);
    $response->assertJsonPath('document.original_filename', 'Deed of Land.pdf');

    // Update
    $docData['original_filename'] = 'Deed of Land Updated.pdf';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/documents/{$docId}", $docData);
    $response->assertStatus(200);
    $response->assertJsonPath('document.original_filename', 'Deed of Land Updated.pdf');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Documents',
        'detail' => 'Updated document Deed of Land Updated.pdf',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/documents/{$docId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Documents',
        'detail' => 'Deleted document Deed of Land Updated.pdf',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/documents/{$docId}");
    $response->assertStatus(404);
});

test('documents file upload and download operations', function () {
    Storage::fake('acquisition_case_documents');

    $project = Projects::create([
        'project_id' => 'PRJ-101',
        'title' => 'Test Project Name 2',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Lands',
        'institution_address' => 'Acquisition Department',
        'land_area_to_be_acquired_acers' => 10.0,
        'land_area_to_be_acquired_roods' => 0.0,
        'land_area_to_be_acquired_perches' => 0.0,
        'full_land_area_to_be_acquired' => 1600.0,
        'are_residents_moved_temp' => false,
        'status' => 'pending',
        'remarks' => 'Urgent priority',
    ]);

    $file = UploadedFile::fake()->create('contract.pdf', 1500); // 1.5MB PDF file

    $uploadData = [
        'user_id' => $this->user->id,
        'project_id' => $project->id,
        'document_category' => 'Legal',
        'file' => $file,
    ];

    // Create / Upload
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/documents', $uploadData);
    $response->assertStatus(201);
    $response->assertJsonPath('document.original_filename', 'contract.pdf');
    $response->assertJsonPath('document.file_size', '1.5 MB');

    $doc = $response->json('document');
    $docId = $doc['id'];
    $filePath = $doc['file_path'];

    // Assert file exists on the fake disk
    Storage::disk('acquisition_case_documents')->assertExists($filePath);

    // Download file
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/documents/{$docId}/download");
    $response->assertStatus(200);
    $response->assertHeader('content-disposition', 'attachment; filename=contract.pdf');

    // Update with new file
    $newFile = UploadedFile::fake()->create('contract_v2.pdf', 2500); // 2.5MB
    $updateData = [
        'user_id' => $this->user->id,
        'project_id' => $project->id,
        'document_category' => 'Legal Updated',
        'file' => $newFile,
    ];

    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/documents/{$docId}", $updateData);
    $response->assertStatus(200);
    $response->assertJsonPath('document.original_filename', 'contract_v2.pdf');
    $response->assertJsonPath('document.file_size', '2.4 MB'); // 2500 KB / 1024 ~ 2.44 MB

    $newDoc = $response->json('document');
    $newFilePath = $newDoc['file_path'];

    // Assert new file exists and old file is deleted
    Storage::disk('acquisition_case_documents')->assertExists($newFilePath);
    Storage::disk('acquisition_case_documents')->assertMissing($filePath);

    // Delete document
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/documents/{$docId}");
    $response->assertStatus(204);

    // Assert file is deleted from disk
    Storage::disk('acquisition_case_documents')->assertMissing($newFilePath);
});

test('audit logs crud operations', function () {
    $logData = [
        'user_id' => $this->user->id,
        'action' => 'Create Land Parcel',
        'detail' => 'Created land parcel PAR-999 successfully',
    ];

    // Create
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/audit-logs', $logData);
    $response->assertStatus(201);
    $response->assertJsonPath('audit_log.action', 'Create Land Parcel');
    $logId = $response->json('audit_log.id');

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/audit-logs');
    $response->assertStatus(200);
    $response->assertJsonFragment(['action' => 'Create Land Parcel']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/audit-logs/{$logId}");
    $response->assertStatus(200);
    $response->assertJsonPath('audit_log.action', 'Create Land Parcel');

    // Update
    $logData['detail'] = 'Updated detail info';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/audit-logs/{$logId}", $logData);
    $response->assertStatus(200);
    $response->assertJsonPath('audit_log.detail', 'Updated detail info');

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/audit-logs/{$logId}");
    $response->assertStatus(204);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/audit-logs/{$logId}");
    $response->assertStatus(404);
});

test('departments crud operations', function () {
    $deptData = [
        'department_name' => 'Survey and Mapping Department',
        'dep_code' => 'SMD',
        'dep_head' => 'T. Wickramasinghe',
        'email' => 'survey.mapping@lams.gov.lk',
        'phone' => '+94711122233',
        'staff' => 15,
        'status' => 'active',
    ];

    // Create
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/departments', $deptData);
    $response->assertStatus(201);
    $response->assertJsonPath('department.dep_code', 'SMD');
    $deptId = $response->json('department.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Departments',
        'detail' => 'Created department Survey and Mapping Department',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/departments');
    $response->assertStatus(200);
    $response->assertJsonFragment(['dep_code' => 'SMD']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/departments/{$deptId}");
    $response->assertStatus(200);
    $response->assertJsonPath('department.dep_code', 'SMD');

    // Update
    $deptData['dep_head'] = 'A. Perera';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/departments/{$deptId}", $deptData);
    $response->assertStatus(200);
    $response->assertJsonPath('department.dep_head', 'A. Perera');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Departments',
        'detail' => 'Updated department Survey and Mapping Department',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/departments/{$deptId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Departments',
        'detail' => 'Deleted department Survey and Mapping Department',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/departments/{$deptId}");
    $response->assertStatus(404);
});

test('roles crud operations', function () {
    $roleData = [
        'role_name' => 'Manager',
        'description' => 'Manager Role',
    ];

    // Create
    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/roles', $roleData);
    $response->assertStatus(201);
    $response->assertJsonPath('role.role_name', 'Manager');
    $roleId = $response->json('role.id');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Create',
        'module' => 'Roles',
        'detail' => 'Created role Manager',
    ]);

    // Get All
    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/roles');
    $response->assertStatus(200);
    $response->assertJsonFragment(['role_name' => 'Manager']);

    // Get One
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/roles/{$roleId}");
    $response->assertStatus(200);
    $response->assertJsonPath('role.role_name', 'Manager');

    // Update
    $roleData['description'] = 'Updated Manager Role';
    $response = $this->actingAs($this->user, 'sanctum')->putJson("/api/roles/{$roleId}", $roleData);
    $response->assertStatus(200);
    $response->assertJsonPath('role.description', 'Updated Manager Role');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Update',
        'module' => 'Roles',
        'detail' => 'Updated role Manager',
    ]);

    // Delete
    $response = $this->actingAs($this->user, 'sanctum')->deleteJson("/api/roles/{$roleId}");
    $response->assertStatus(204);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Delete',
        'module' => 'Roles',
        'detail' => 'Deleted role Manager',
    ]);

    // Verify deleted
    $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/roles/{$roleId}");
    $response->assertStatus(404);
});

test('land parcel status transitions on creation and project association', function () {
    // 1. A land parcel status should be "available" when a new land is created.
    $parcelData = [
        'parcel_id' => 'PAR-12345',
        'lot_no' => 'Lot 10',
        'district' => 'Galle',
        'division' => 'Bope-Poddala',
        'village' => 'Pinnaduwa',
        'extent_acers' => 1.5,
        'extent_perches' => 20.0,
        'remarks' => 'Test remarks',
        'status' => 'pending', // Even if we send pending, it should be created as available
    ];

    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/land-parcels', $parcelData);
    $response->assertStatus(201);
    $response->assertJsonPath('land_parcel.status', 'available');
    $parcelId = $response->json('land_parcel.id');

    // Also check database
    $this->assertDatabaseHas('land_parcels', [
        'id' => $parcelId,
        'status' => 'available',
    ]);

    // Create a second parcel
    $parcelData2 = $parcelData;
    $parcelData2['parcel_id'] = 'PAR-54321';
    $response2 = $this->actingAs($this->user, 'sanctum')->postJson('/api/land-parcels', $parcelData2);
    $response2->assertStatus(201);
    $parcelId2 = $response2->json('land_parcel.id');

    // 2. Update landparcel status to pending when an acquisition case (project) is made.
    $projectData = [
        'project_id' => 'PRJ-TEST-CASE',
        'title' => 'Acquisition Case Project',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Lands',
        'institution_address' => 'Galle',
        'land_area_to_be_acquired_acers' => 5.0,
        'land_area_to_be_acquired_roods' => 0.0,
        'land_area_to_be_acquired_perches' => 0.0,
        'full_land_area_to_be_acquired' => 800.0,
        'are_residents_moved_temp' => false,
        'status' => 'pending',
        'parcel_ids' => [$parcelId],
    ];

    $responseProject = $this->actingAs($this->user, 'sanctum')->postJson('/api/projects', $projectData);
    $responseProject->assertStatus(201);
    $projectId = $responseProject->json('project.id');

    // Verify parcel status changed to pending
    $this->assertDatabaseHas('land_parcels', [
        'id' => $parcelId,
        'status' => 'pending',
        'project_id' => $projectId,
    ]);

    // 3. Update project: dissociate $parcelId (should become available) and associate $parcelId2 (should become pending)
    $projectData['parcel_ids'] = [$parcelId2];
    $responseUpdateProject = $this->actingAs($this->user, 'sanctum')->putJson("/api/projects/{$projectId}", $projectData);
    $responseUpdateProject->assertStatus(200);

    // Verify dissociated parcel is back to available
    $this->assertDatabaseHas('land_parcels', [
        'id' => $parcelId,
        'status' => 'available',
        'project_id' => null,
    ]);

    // Verify newly associated parcel is pending
    $this->assertDatabaseHas('land_parcels', [
        'id' => $parcelId2,
        'status' => 'pending',
        'project_id' => $projectId,
    ]);
});
