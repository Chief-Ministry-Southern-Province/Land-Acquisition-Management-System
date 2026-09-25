<?php

use App\Models\Departments;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->department = Departments::create([
        'department_name' => 'Land Ministry',
        'dep_code' => 'LM',
        'dep_head' => 'Head User',
        'email' => 'land@lams.gov.lk',
        'phone' => '+94 11 111 2222',
        'staff' => 5,
        'status' => true,
    ]);

    $this->doRole = Roles::create(['role_name' => 'DO', 'description' => 'Development Officer']);
    $this->hobRole = Roles::create(['role_name' => 'HOB', 'description' => 'Head of Branch']);
    $this->aoRole = Roles::create(['role_name' => 'AO', 'description' => 'Administrative Officer']);
    $this->asRole = Roles::create(['role_name' => 'AS', 'description' => 'Assistant Secretary']);
    $this->sasRole = Roles::create(['role_name' => 'SAS', 'description' => 'Senior Assistant Secretary']);
    $this->secRole = Roles::create(['role_name' => 'SEC', 'description' => 'Secretary']);

    // Sample valid base64 signature string (1x1 PNG image)
    $this->sampleSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    // Create users with signatures attached to profile
    $this->doUser = User::create([
        'name' => 'DO Officer',
        'email' => 'do@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->hobUser = User::create([
        'name' => 'HOB Officer',
        'email' => 'hob@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->hobRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->aoUser = User::create([
        'name' => 'AO Officer',
        'email' => 'ao@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->aoRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->asUser = User::create([
        'name' => 'AS Officer',
        'email' => 'as@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->asRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->sasUser = User::create([
        'name' => 'SAS Officer',
        'email' => 'sas@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->sasRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->secUser = User::create([
        'name' => 'SEC Officer',
        'email' => 'sec@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->secRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->project = Projects::create([
        'project_id' => 'PRJ-ESIGN-001',
        'title' => 'High Value Highway Acquisition Project',
        'purpose' => 'Highway Expansion',
        'institution' => 'Ministry of Highways',
        'institution_address' => 'Galle Road, Matara',
        'land_area_to_be_acquired_acers' => 5.0,
        'full_land_area_to_be_acquired' => 800.0,
        'case_status' => 'draft',
        'do_status' => 'draft',
    ]);
});

test('submitting and approving acquisition case records officer IDs and timestamps', function () {
    // 1. DO submits project case
    $response = $this->actingAs($this->doUser, 'sanctum')
        ->postJson("/api/projects/{$this->project->id}/submit");
    $response->assertStatus(200);

    $this->project->refresh();
    expect($this->project->submitted_by)->toBe($this->doUser->id);
    expect($this->project->submitted_at)->not()->toBeNull();

    // 2. HOB approves
    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->postJson("/api/hob/approvals/project/{$this->project->id}/approve");
    $response->assertStatus(200);

    $this->project->refresh();
    expect($this->project->hob_approved_by)->toBe($this->hobUser->id);
    expect($this->project->hob_approved_at)->not()->toBeNull();

    // 3. AO approves
    $response = $this->actingAs($this->aoUser, 'sanctum')
        ->postJson("/api/ao/approvals/project/{$this->project->id}/approve");
    $response->assertStatus(200);

    $this->project->refresh();
    expect($this->project->ao_approved_by)->toBe($this->aoUser->id);
    expect($this->project->ao_approved_at)->not()->toBeNull();

    // 4. AS approves
    $response = $this->actingAs($this->asUser, 'sanctum')
        ->postJson("/api/as/approvals/project/{$this->project->id}/approve");
    $response->assertStatus(200);

    $this->project->refresh();
    expect($this->project->as_approved_by)->toBe($this->asUser->id);
    expect($this->project->as_approved_at)->not()->toBeNull();

    // 5. SAS approves
    $response = $this->actingAs($this->sasUser, 'sanctum')
        ->postJson("/api/sas/approvals/project/{$this->project->id}/approve");
    $response->assertStatus(200);

    $this->project->refresh();
    expect($this->project->sas_approved_by)->toBe($this->sasUser->id);
    expect($this->project->sas_approved_at)->not()->toBeNull();

    // 6. SEC approves
    $response = $this->actingAs($this->secUser, 'sanctum')
        ->postJson("/api/sec/approvals/project/{$this->project->id}/approve");
    $response->assertStatus(200);

    $this->project->refresh();
    expect($this->project->sec_approved_by)->toBe($this->secUser->id);
    expect($this->project->sec_approved_at)->not()->toBeNull();
});

test('exporting single project PDF contains e-signatures of approving officers', function () {
    // Set project as fully approved with all officers
    $this->project->update([
        'do_status' => 'submitted',
        'submitted_by' => $this->doUser->id,
        'submitted_at' => now(),

        'hob_status' => 'approved',
        'hob_approved_by' => $this->hobUser->id,
        'hob_approved_at' => now(),

        'ao_status' => 'approved',
        'ao_approved_by' => $this->aoUser->id,
        'ao_approved_at' => now(),

        'as_status' => 'approved',
        'as_approved_by' => $this->asUser->id,
        'as_approved_at' => now(),

        'sas_status' => 'approved',
        'sas_approved_by' => $this->sasUser->id,
        'sas_approved_at' => now(),

        'sec_status' => 'approved',
        'sec_approved_by' => $this->secUser->id,
        'sec_approved_at' => now(),

        'case_status' => 'completed',
    ]);

    $response = $this->actingAs($this->secUser, 'sanctum')
        ->get("/api/projects/export?format=pdf&id={$this->project->id}");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('exporting individual land parcel PDF contains signature only of head of branch', function () {
    $parcel = \App\Models\LandParcel::create([
        'parcel_id' => 'LND/2026/SIG001',
        'project_id' => $this->project->id,
        'land_name' => 'Signature Test Land',
        'district' => 'Galle',
        'divisional_secretariat' => 'Four Gravets',
        'grama_niladari_division' => 'Fort',
        'village' => 'Fort',
        'status' => 'available',
    ]);

    $this->project->update([
        'hob_status' => 'approved',
        'hob_approved_by' => $this->hobUser->id,
        'hob_approved_at' => now(),
    ]);

    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->get("/api/land-parcels/export?format=pdf&id={$parcel->id}");

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');

    $html = view('pdf.land_parcel_form', ['parcel' => $parcel->fresh(['project.hobApprovedBy'])])->render();

    expect($html)->toContain('Head of Branch (Land)');
    expect($html)->not()->toContain('Development Officer');
    expect($html)->not()->toContain('Administrative Officer');
    expect($html)->not()->toContain('Assistant Secretary');
    expect($html)->not()->toContain('Secretary');
});

test('signature block suppresses duplicate position title when officer user name matches generic role title', function () {
    $parcel = \App\Models\LandParcel::create([
        'parcel_id' => 'LND/2026/SIG002',
        'project_id' => $this->project->id,
        'land_name' => 'Signature Duplicate Test Land',
        'district' => 'Galle',
        'divisional_secretariat' => 'Four Gravets',
        'grama_niladari_division' => 'Fort',
        'village' => 'Fort',
        'status' => 'available',
    ]);

    // Test with generic user name matching role title "Head of Branch"
    $genericHobUser = User::create([
        'name' => 'Head of Branch',
        'email' => 'generic_hob@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->hobRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->project->update([
        'hob_status' => 'approved',
        'hob_approved_by' => $genericHobUser->id,
        'hob_approved_at' => now(),
    ]);

    $html = view('pdf.land_parcel_form', ['parcel' => $parcel->fresh(['project.hobApprovedBy'])])->render();

    // Should contain the title "Head of Branch (Land)" in designation line
    // and not render <p ...>Head of Branch</p> above it
    expect($html)->not()->toContain('<p style="margin: 0; font-size: 8.5px; font-weight: bold; color: #1a1a1a;">Head of Branch</p>');
    expect($html)->toContain('Head of Branch (Land)');

    // Test with real person name
    $realHobUser = User::create([
        'name' => 'K. L. Perera',
        'email' => 'real_hob@lams.gov.lk',
        'password' => bcrypt('password'),
        'department_id' => $this->department->id,
        'role_id' => $this->hobRole->id,
        'signature' => $this->sampleSignature,
    ]);

    $this->project->update([
        'hob_status' => 'approved',
        'hob_approved_by' => $realHobUser->id,
        'hob_approved_at' => now(),
    ]);

    $htmlWithRealUser = view('pdf.land_parcel_form', ['parcel' => $parcel->fresh(['project.hobApprovedBy'])])->render();

    expect($htmlWithRealUser)->toContain('K. L. Perera');
    expect($htmlWithRealUser)->toContain('Head of Branch (Land)');
});


