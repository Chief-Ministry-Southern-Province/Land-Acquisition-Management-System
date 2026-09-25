<?php

use App\Models\Departments;
use App\Models\ProjectProgress;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;

beforeEach(function () {
    $this->department = Departments::firstOrCreate([
        'department_name' => 'IT Department',
    ], [
        'dep_code' => 'IT',
        'dep_head' => 'Head Officer',
        'email' => 'it@lams.gov.lk',
        'phone' => '+94 11 890 1234',
        'staff' => 5,
        'status' => true,
    ]);

    $this->doRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer']);
    $this->hobRole = Roles::firstOrCreate(['role_name' => 'HOB'], ['description' => 'Head of Branch']);

    $this->doUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
    ]);

    $this->hobUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $this->hobRole->id,
    ]);

    $this->project = Projects::create([
        'project_id' => 'PRJ-TEST-001',
        'title' => 'Test Acquisition Case',
        'purpose' => 'Highway Construction',
        'institution' => 'RDA',
        'institution_address' => 'Colombo',
        'submitted_by' => $this->doUser->id,
        'submitted_at' => now(),
    ]);
});

test('only development officer can save acquisition case progress', function () {
    $stagesData = [
        [
            'id' => 1,
            'name' => 'Section 2 Order & Preliminary Survey',
            'items' => [
                [
                    'id' => 'chk-1-1',
                    'title' => 'Requisition Application Submission',
                    'isCompleted' => true,
                    'remarks' => 'Submitted officially',
                ],
            ],
        ],
    ];

    // Non-DO user gets 403 Forbidden
    $response = $this->actingAs($this->hobUser)
        ->postJson("/api/projects/{$this->project->id}/progress", [
            'stages' => $stagesData,
        ]);

    $response->assertStatus(403);

    // DO user can successfully save progress
    $responseDo = $this->actingAs($this->doUser)
        ->postJson("/api/projects/{$this->project->id}/progress", [
            'stages' => $stagesData,
        ]);

    $responseDo->assertStatus(200)
        ->assertJsonPath('message', 'Acquisition progress saved successfully.');

    expect(ProjectProgress::where('project_id', $this->project->id)->count())->toBe(1);
});

test('acquisition case and progress has a one to one relationship', function () {
    $stagesData = [
        [
            'id' => 1,
            'name' => 'Section 2 Order',
            'items' => [
                ['id' => 'chk-1-1', 'title' => 'Notice', 'isCompleted' => true],
            ],
        ],
    ];

    // First save
    $this->actingAs($this->doUser)
        ->postJson("/api/projects/{$this->project->id}/progress", [
            'stages' => $stagesData,
        ]);

    // Second save updates the existing 1-to-1 progress record instead of creating another
    $this->actingAs($this->doUser)
        ->postJson("/api/projects/{$this->project->id}/progress", [
            'stages' => $stagesData,
        ]);

    expect(ProjectProgress::where('project_id', $this->project->id)->count())->toBe(1);
    expect($this->project->progress)->not->toBeNull();
    expect($this->project->progress->project_id)->toBe($this->project->id);
});

test('authenticated user can view acquisition case progress', function () {
    ProjectProgress::create([
        'project_id' => $this->project->id,
        'stages' => [
            ['id' => 1, 'name' => 'Section 2 Order', 'items' => []],
        ],
        'total_items' => 3,
        'completed_items' => 1,
        'progress_percentage' => 33,
        'updated_by' => $this->doUser->id,
        'last_saved_at' => now(),
    ]);

    $response = $this->actingAs($this->hobUser)
        ->getJson("/api/projects/{$this->project->id}/progress");

    $response->assertStatus(200)
        ->assertJsonPath('progress.progress_percentage', 33);
});
