<?php

use App\Mail\GenericEmail;
use App\Models\Departments;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\postJson;

beforeEach(function () {
    Mail::fake();
    Http::fake();

    $this->department = Departments::firstOrCreate([
        'department_name' => 'Land Division',
    ], [
        'dep_code' => 'LD',
        'dep_head' => 'Head Officer',
        'email' => 'land@lams.gov.lk',
        'phone' => '+94 11 890 1234',
        'staff' => 5,
        'status' => true,
    ]);

    $this->adminRole = Roles::firstOrCreate(['role_name' => 'Admin'], ['description' => 'Administrator']);
    $this->doRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer']);
    $this->hobRole = Roles::firstOrCreate(['role_name' => 'HOB'], ['description' => 'Head of Branch']);
    $this->aoRole = Roles::firstOrCreate(['role_name' => 'AO'], ['description' => 'Administrative Officer']);

    $this->adminUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->adminRole->id,
    ]);

    $this->doUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
        'email' => 'do@lams.gov.lk',
    ]);

    $this->hobUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->hobRole->id,
        'email' => 'hob@lams.gov.lk',
    ]);

    $this->aoUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->aoRole->id,
        'email' => 'ao@lams.gov.lk',
    ]);
});

test('generic sendEmail function sends email successfully', function () {
    $sent = EmailService::sendEmail(
        to: 'officer@example.com',
        subject: 'Test Subject',
        view: 'emails.case_pending_approval',
        data: [
            'recipient' => $this->hobUser,
            'project' => (object) ['title' => 'Sample Land Project', 'id' => 101, 'district' => 'Galle', 'divisional_sec' => 'Galle Four Gravets'],
            'stageName' => 'Head of Branch Review',
            'actionUrl' => 'http://localhost:8000/approval-workflow',
        ]
    );

    expect($sent)->toBeTrue();

    Mail::assertSent(GenericEmail::class, function ($mail) {
        return $mail->hasTo('officer@example.com') && $mail->customSubject === 'Test Subject';
    });
});

test('user creation dispatches auto-generated password credentials email and SMS to user', function () {
    Log::shouldReceive('channel')->andReturnSelf();
    Log::shouldReceive('info')->atLeast()->once();

    $payload = [
        'name' => 'John Officer',
        'email' => 'johnofficer@lams.gov.lk',
        'phone' => '+94771234567',
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
    ];

    $response = postJson('/api/auth/register', $payload);
    $response->assertStatus(201);

    Mail::assertSent(GenericEmail::class, function ($mail) {
        return $mail->hasTo('johnofficer@lams.gov.lk') &&
            str_contains($mail->customSubject, 'Account Credentials') &&
            ! empty($mail->data['password']);
    });
});

test('submitting a project sends pending approval email to HOB officer', function () {
    $project = Projects::create([
        'project_id' => 'PRJ-101',
        'title' => 'Southern Expressway Expansion',
        'name' => 'Southern Expressway Expansion',
        'purpose' => 'Infrastructure Development',
        'institution' => 'Ministry of Highways',
        'do_status' => 'draft',
        'case_status' => 'draft',
    ]);

    $response = $this->actingAs($this->doUser, 'sanctum')
        ->postJson("/api/projects/{$project->id}/submit");

    $response->assertStatus(200);

    Mail::assertSent(GenericEmail::class, function ($mail) {
        return $mail->hasTo('hob@lams.gov.lk') && str_contains($mail->customSubject, 'Case Pending Approval');
    });
});

test('HOB approval sends pending approval email to AO officer', function () {
    $project = Projects::create([
        'project_id' => 'PRJ-102',
        'title' => 'Matara Highway Project',
        'name' => 'Matara Highway Project',
        'purpose' => 'Road Construction',
        'institution' => 'RDA',
        'do_status' => 'submitted',
        'hob_status' => 'pending',
        'case_status' => 'pending',
    ]);

    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->postJson("/api/hob/approvals/project/{$project->id}/approve");

    $response->assertStatus(200);

    Mail::assertSent(GenericEmail::class, function ($mail) {
        return $mail->hasTo('ao@lams.gov.lk') && str_contains($mail->customSubject, 'Case Pending Approval');
    });
});

test('HOB rejection sends case denied email to DO officer', function () {
    $project = Projects::create([
        'project_id' => 'PRJ-103',
        'title' => 'Galle Fort Renovation Project',
        'name' => 'Galle Fort Renovation Project',
        'purpose' => 'Heritage Preservation',
        'institution' => 'Tourism Authority',
        'do_status' => 'submitted',
        'hob_status' => 'pending',
        'case_status' => 'pending',
    ]);

    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->postJson("/api/hob/approvals/project/{$project->id}/reject", [
            'comment' => 'Incomplete survey documentation.',
        ]);

    $response->assertStatus(200);

    Mail::assertSent(GenericEmail::class, function ($mail) {
        return $mail->hasTo('do@lams.gov.lk') && str_contains($mail->customSubject, 'Case Alert');
    });
});
