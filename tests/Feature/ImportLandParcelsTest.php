<?php

use App\Models\Departments;
use App\Models\LandParcel;
use App\Models\Projects;
use App\Models\PropertyOwner;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Http\UploadedFile;

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

    // Create a project for test
    $this->project = Projects::create([
        'project_id' => 'PRJ-100',
        'title' => 'Test Project',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Lands',
        'institution_address' => 'Galle',
        'land_area_to_be_acquired_acers' => 10.0,
        'land_area_to_be_acquired_roods' => 0.0,
        'land_area_to_be_acquired_perches' => 0.0,
        'full_land_area_to_be_acquired' => 1600.0,
        'are_residents_moved_temp' => false,
        'status' => 'pending',
    ]);

    // Create an existing property owner
    $this->owner = PropertyOwner::create([
        'owner_id' => 'OWN-1234',
        'name' => 'Owner A',
        'nic' => '198012345678',
        'address' => '123 Main St, Galle',
        'contact' => '+94777777777',
    ]);
});

test('import land parcels successfully', function () {
    $csvContent = implode("\n", [
        'Land Number,Associated Project,Land Name,District,Division,Village,Owner Name,Extent,Remarks,Current Status',
        'PAR-TEST-1,Test Project,Lot 100,Galle,Four Gravets,Galle City,Owner A,2.5 ac,Remarks 1,Available',
        'PAR-TEST-2,Test Project,Lot 101,Matara,Weligama,Weligama Town,Owner B,1.0 ac 15 per,Remarks 2,Pending',
        'PAR-TEST-3,N/A,Lot 102,Hambantota,Tangalle,Tangalle Town,"Owner C, Owner D",20 per,Remarks 3,Acquired',
    ]);

    $tempFile = tempnam(sys_get_temp_dir(), 'import_test_');
    file_put_contents($tempFile, $csvContent);

    $uploadedFile = new UploadedFile(
        $tempFile,
        'land_parcels.csv',
        'text/csv',
        null,
        true
    );

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/land-parcels/import', [
            'file' => $uploadedFile,
        ]);

    @unlink($tempFile);

    $response->assertStatus(200);
    $response->assertJson([
        'message' => 'Land parcels imported successfully',
        'imported_count' => 3,
        'failures' => [],
    ]);

    // Verify database entries
    $parcel1 = LandParcel::where('parcel_id', 'PAR-TEST-1')->first();
    expect($parcel1)->not->toBeNull();
    expect($parcel1->project_id)->toBe($this->project->id);
    expect((float) $parcel1->land_size_acers)->toBe(2.5);
    expect((float) $parcel1->land_size_perches)->toBe(0.0);
    expect($parcel1->status)->toBe('available');
    expect($parcel1->owners->pluck('name')->toArray())->toBe(['Owner A']);

    $parcel2 = LandParcel::where('parcel_id', 'PAR-TEST-2')->first();
    expect($parcel2)->not->toBeNull();
    expect($parcel2->project_id)->toBe($this->project->id);
    expect((float) $parcel2->land_size_acers)->toBe(1.0);
    expect((float) $parcel2->land_size_perches)->toBe(15.0);
    expect($parcel2->status)->toBe('pending');
    expect($parcel2->owners->pluck('name')->toArray())->toBe(['Owner B']);

    $parcel3 = LandParcel::where('parcel_id', 'PAR-TEST-3')->first();
    expect($parcel3)->not->toBeNull();
    expect($parcel3->project_id)->toBeNull();
    expect((float) $parcel3->land_size_acers)->toBe(0.0);
    expect((float) $parcel3->land_size_perches)->toBe(20.0);
    expect($parcel3->status)->toBe('acquired');
    expect($parcel3->owners->pluck('name')->toArray())->toContain('Owner C', 'Owner D');

    // Verify audit logs
    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'action' => 'Import',
        'module' => 'Land Parcels',
        'detail' => 'Imported 3 records into LandParcel',
    ]);
});

test('import validation errors handled and skipped', function () {
    // PAR-TEST-DUP will be a duplicate parcel ID
    LandParcel::create([
        'parcel_id' => 'PAR-TEST-DUP',
        'land_name' => 'Existing Land',
        'province' => 'Southern',
        'district' => 'Galle',
        'divisional_secretariat' => 'Four Gravets',
        'grama_niladari_division' => 'Galle',
        'village' => 'Galle',
        'land_size_acers' => 1.0,
        'land_size_roods' => 0.0,
        'land_size_perches' => 0.0,
        'full_land_size' => 160.0,
        'has_plan' => false,
        'has_residential_houses' => false,
        'is_resident_owner' => false,
        'cultivation' => 'N/A',
        'cultivation_status' => 'fertile',
        'annual_income' => 0.0,
        'land_type' => 'Standard',
        'estimated_value' => 0.0,
        'status' => 'available',
    ]);

    $csvContent = implode("\n", [
        'Land Number,Associated Project,Land Name,District,Division,Village,Owner Name,Extent,Remarks,Current Status',
        'PAR-TEST-DUP,Test Project,Lot 100,Galle,Four Gravets,Galle City,Owner A,2.5 ac,Remarks 1,Available', // Should fail validation (duplicate parcel_id)
        'PAR-TEST-VALID,Test Project,Lot 101,Matara,Weligama,Weligama Town,Owner B,1.0 ac,Remarks 2,Pending', // Should succeed
        ',Test Project,Lot 102,Hambantota,Tangalle,Tangalle Town,Owner C,20 per,Remarks 3,Acquired', // Should fail validation (missing parcel_id)
    ]);

    $tempFile = tempnam(sys_get_temp_dir(), 'import_test_');
    file_put_contents($tempFile, $csvContent);

    $uploadedFile = new UploadedFile(
        $tempFile,
        'land_parcels.csv',
        'text/csv',
        null,
        true
    );

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/land-parcels/import', [
            'file' => $uploadedFile,
        ]);

    @unlink($tempFile);

    $response->assertStatus(422);
    $response->assertJsonPath('imported_count', 1);

    $failures = $response->json('failures');
    expect($failures)->toHaveCount(2);

    // First failure (row 2 because header is row 1)
    expect($failures[0]['row'])->toBe(2);
    expect($failures[0]['attribute'])->toBe('land_number');

    // Second failure (row 4)
    expect($failures[1]['row'])->toBe(4);
    expect($failures[1]['attribute'])->toBe('land_number');

    // Verify only the valid one was imported
    $validParcel = LandParcel::where('parcel_id', 'PAR-TEST-VALID')->first();
    expect($validParcel)->not->toBeNull();
});
