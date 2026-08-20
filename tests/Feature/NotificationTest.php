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
