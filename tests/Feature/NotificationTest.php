<?php

use App\Models\Departments;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->department = Departments::firstOrCreate([
        'department_name' => 'IT Department',
    ], [
        'dep_code' => 'IT',
        'dep_head' => 'Admin User',
        'email' => 'it@lams.gov.lk',
        'phone' => '+94 11 890 1234',
        'staff' => 3,
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
});

test('can fetch notifications', function () {
    $this->hobUser->notify(new RealtimeSystemNotification(
        title: 'Acquisition Request',
        message: 'A new parcel requires survey.',
        actionUrl: '/parcels',
        type: 'info'
    ));

    $response = $this->actingAs($this->hobUser, 'sanctum')->getJson('/api/notifications');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'notifications' => [
                '*' => ['id', 'title', 'message', 'action_url', 'type', 'created_at', 'read_at'],
            ],
            'unread_count',
        ]);

    expect($response->json('unread_count'))->toBe(1);
    expect($response->json('notifications.0.title'))->toBe('Acquisition Request');
});

test('can mark a notification as read', function () {
    $this->hobUser->notify(new RealtimeSystemNotification(
        title: 'Acquisition Request',
        message: 'A new parcel requires survey.',
        actionUrl: '/parcels',
        type: 'info'
    ));

    $notification = $this->hobUser->unreadNotifications->first();

    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->postJson("/api/notifications/{$notification->id}/read");

    $response->assertStatus(200);
    expect($this->hobUser->fresh()->unreadNotifications)->toHaveCount(0);
});

test('can mark all notifications as read', function () {
    $this->hobUser->notify(new RealtimeSystemNotification(
        title: 'Req 1',
        message: 'Msg 1',
        type: 'info'
    ));

    $this->hobUser->notify(new RealtimeSystemNotification(
        title: 'Req 2',
        message: 'Msg 2',
        type: 'info'
    ));

    expect($this->hobUser->unreadNotifications)->toHaveCount(2);

    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->postJson('/api/notifications/read-all');

    $response->assertStatus(200);
    expect($this->hobUser->fresh()->unreadNotifications)->toHaveCount(0);
});

test('realtime system notification defines broadcast channels and payload', function () {
    $notification = new RealtimeSystemNotification(
        title: 'Workflow Step Completed',
        message: 'Project PRJ-100 was approved.',
        actionUrl: '/approval-workflow',
        type: 'success'
    );

    expect($notification->via($this->hobUser))->toBe(['database', 'broadcast']);

    $broadcastData = $notification->toBroadcast($this->hobUser)->data;
    expect($broadcastData['title'])->toBe('Workflow Step Completed');
    expect($broadcastData['message'])->toBe('Project PRJ-100 was approved.');
    expect($broadcastData['type'])->toBe('success');
    expect($broadcastData['action_url'])->toBe('/approval-workflow');
});

test('project submission triggers notification to HOB users', function () {
    Notification::fake();

    $project = Projects::create([
        'project_id' => 'PRJ-TEST-123',
        'title' => 'Test Project Name',
        'purpose' => 'Public Hospital Construction',
        'case_status' => 'draft',
        'do_status' => 'draft',
    ]);

    $response = $this->actingAs($this->doUser, 'sanctum')
        ->postJson("/api/projects/{$project->id}/submit");

    $response->assertStatus(200);

    Notification::assertSentTo(
        [$this->hobUser],
        RealtimeSystemNotification::class,
        function ($notification) use ($project) {
            return $notification->title === 'New Project Submitted' &&
                   str_contains($notification->message, $project->title);
        }
    );
});

test('HOB approval triggers notification to AO users', function () {
    Notification::fake();

    $aoRole = Roles::firstOrCreate(['role_name' => 'AO'], ['description' => 'Administrative Officer']);
    $aoUser = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $aoRole->id,
    ]);

    $project = Projects::create([
        'project_id' => 'PRJ-TEST-124',
        'title' => 'HOB Approval Test Project',
        'purpose' => 'Road Expansion',
        'case_status' => 'pending',
        'do_status' => 'submitted',
        'hob_status' => 'pending',
    ]);

    $response = $this->actingAs($this->hobUser, 'sanctum')
        ->postJson("/api/hob/approvals/project/{$project->id}/approve");

    $response->assertStatus(200);

    Notification::assertSentTo(
        [$aoUser],
        RealtimeSystemNotification::class,
        function ($notification) use ($project) {
            return $notification->title === 'Project Approved by HOB' &&
                   str_contains($notification->message, $project->title);
        }
    );
});

test('project submission notifies ONLY HOB of related institution and not other institutions', function () {
    Notification::fake();

    $deptB = Departments::create([
        'department_name' => 'Health Department',
        'dep_code' => 'HLT',
        'dep_head' => 'Dr. Perera',
        'email' => 'health@lams.gov.lk',
        'phone' => '+94 11 999 8888',
        'staff' => 5,
        'status' => true,
    ]);

    $hobDeptB = User::factory()->create([
        'department_id' => $deptB->id,
        'role_id' => $this->hobRole->id,
    ]);

    $project = Projects::create([
        'project_id' => 'PRJ-INST-001',
        'title' => 'IT Infrastructure Upgrade',
        'purpose' => 'Server expansion',
        'institution' => 'IT Department',
        'case_status' => 'draft',
        'do_status' => 'draft',
    ]);

    $response = $this->actingAs($this->doUser, 'sanctum')
        ->postJson("/api/projects/{$project->id}/submit");

    $response->assertStatus(200);

    // Assert notification sent to HOB of IT Department
    Notification::assertSentTo(
        [$this->hobUser],
        RealtimeSystemNotification::class
    );

    // Assert notification was NOT sent to HOB of other department
    Notification::assertNotSentTo(
        [$hobDeptB],
        RealtimeSystemNotification::class
    );
});

test('approval stages only notify officers related to acquisition case institution', function () {
    Notification::fake();

    $deptB = Departments::create([
        'department_name' => 'Education Department',
        'dep_code' => 'EDU',
        'dep_head' => 'Mr. Silva',
        'email' => 'edu@lams.gov.lk',
        'phone' => '+94 11 777 6666',
        'staff' => 4,
        'status' => true,
    ]);

    $aoRole = Roles::firstOrCreate(['role_name' => 'AO'], ['description' => 'Administrative Officer']);
    $asRole = Roles::firstOrCreate(['role_name' => 'AS'], ['description' => 'Assistant Secretary']);

    $aoUserDeptA = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $aoRole->id,
    ]);

    $aoUserDeptB = User::factory()->create([
        'department_id' => $deptB->id,
        'role_id' => $aoRole->id,
    ]);

    $asUserDeptA = User::factory()->create([
        'department_id' => $this->department->id,
        'role_id' => $asRole->id,
    ]);

    $asUserDeptB = User::factory()->create([
        'department_id' => $deptB->id,
        'role_id' => $asRole->id,
    ]);

    $project = Projects::create([
        'project_id' => 'PRJ-STAGE-002',
        'title' => 'Multi-institution Stage Test',
        'purpose' => 'Validation test',
        'institution' => $this->department->department_name,
        'department_id' => $this->department->id,
        'case_status' => 'pending',
        'do_status' => 'submitted',
        'hob_status' => 'pending',
    ]);

    // 1. HOB approves -> should notify AO of Dept A, NOT Dept B
    $this->actingAs($this->hobUser, 'sanctum')
        ->postJson("/api/hob/approvals/project/{$project->id}/approve")
        ->assertStatus(200);

    Notification::assertSentTo([$aoUserDeptA], RealtimeSystemNotification::class);
    Notification::assertNotSentTo([$aoUserDeptB], RealtimeSystemNotification::class);

    // 2. AO approves -> should notify AS of Dept A, NOT Dept B
    $this->actingAs($aoUserDeptA, 'sanctum')
        ->postJson("/api/ao/approvals/project/{$project->id}/approve")
        ->assertStatus(200);

    Notification::assertSentTo([$asUserDeptA], RealtimeSystemNotification::class);
    Notification::assertNotSentTo([$asUserDeptB], RealtimeSystemNotification::class);
});
