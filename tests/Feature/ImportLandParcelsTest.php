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

test('import land parcels with detailed owner and resident columns', function () {
    $csvContent = implode("\n", [
        'Land Number,Associated Project,Land Name,District,Division,Village,Owner Name,Owner NIC,Owner Address,Owner Contact,Extent,Remarks,Current Status,Resident Name,Resident NIC,Resident Address,Resident Contact,Resident Relationship',
        'PAR-DET-1,Test Project,Lot 200,Galle,Four Gravets,Galle City,Owner A,198012345678,123 Main St Galle,+94777777777,2.5 ac,Detail test,Available,Res One,200012345678,456 Elm St Galle,+94771111111,tenant',
        'PAR-DET-2,Test Project,Lot 201,Matara,Weligama,Weligama Town,New Owner X;New Owner Y,199912345678;200112345678,10 First Lane Matara;20 Second Lane Matara,+94772222222;+94773333333,1.0 ac 10 per,Multi owner test,Pending,Res Two;Res Three,200212345678;200312345678,30 Third Lane;40 Fourth Lane,+94774444444;+94775555555,owner;family_member',
    ]);

    $tempFile = tempnam(sys_get_temp_dir(), 'import_det_');
    file_put_contents($tempFile, $csvContent);

    $uploadedFile = new UploadedFile(
        $tempFile,
        'land_parcels_detailed.csv',
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
        'imported_count' => 2,
        'failures' => [],
    ]);

    // Verify parcel 1 – single owner with details + single resident
    $parcel1 = LandParcel::where('parcel_id', 'PAR-DET-1')->first();
    expect($parcel1)->not->toBeNull();
    expect($parcel1->owners)->toHaveCount(1);

    $ownerA = $parcel1->owners->first();
    expect($ownerA->name)->toBe('Owner A');
    // Existing owner was found by name; NIC/address/contact were already set from beforeEach, so not overwritten
    expect($ownerA->nic)->toBe('198012345678');
    expect($ownerA->address)->toBe('123 Main St, Galle');
    expect($ownerA->contact)->toBe('+94777777777');

    // Verify resident
    expect($parcel1->residents)->toHaveCount(1);
    $res1 = $parcel1->residents->first();
    expect($res1->name)->toBe('Res One');
    expect($res1->nic)->toBe('200012345678');
    expect($res1->address)->toBe('456 Elm St Galle');
    expect($res1->contact)->toBe('94771111111');
    expect($res1->relationship)->toBe('tenant');

    // Verify parcel 2 – two owners with semicolon-separated details + two residents
    $parcel2 = LandParcel::where('parcel_id', 'PAR-DET-2')->first();
    expect($parcel2)->not->toBeNull();
    expect($parcel2->owners)->toHaveCount(2);

    $ownerNames = $parcel2->owners->pluck('name')->sort()->values()->toArray();
    expect($ownerNames)->toBe(['New Owner X', 'New Owner Y']);

    $ownerX = $parcel2->owners->firstWhere('name', 'New Owner X');
    expect($ownerX->nic)->toBe('199912345678');
    expect($ownerX->address)->toBe('10 First Lane Matara');
    expect($ownerX->contact)->toBe('+94772222222');

    $ownerY = $parcel2->owners->firstWhere('name', 'New Owner Y');
    expect($ownerY->nic)->toBe('200112345678');
    expect($ownerY->address)->toBe('20 Second Lane Matara');
    expect($ownerY->contact)->toBe('+94773333333');

    // Verify residents
    expect($parcel2->residents)->toHaveCount(2);
    $resTwo = $parcel2->residents->firstWhere('name', 'Res Two');
    expect($resTwo->nic)->toBe('200212345678');
    expect($resTwo->address)->toBe('30 Third Lane');
    expect($resTwo->contact)->toBe('+94774444444');
    expect($resTwo->relationship)->toBe('owner');

    $resThree = $parcel2->residents->firstWhere('name', 'Res Three');
    expect($resThree->nic)->toBe('200312345678');
    expect($resThree->address)->toBe('40 Fourth Lane');
    expect($resThree->contact)->toBe('+94775555555');
    expect($resThree->relationship)->toBe('family_member');
});
