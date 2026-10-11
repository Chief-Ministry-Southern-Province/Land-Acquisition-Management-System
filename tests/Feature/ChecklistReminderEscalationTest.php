<?php

namespace Tests\Feature;

use App\Models\Departments;
use App\Models\ProjectChecklistReminder;
use App\Models\Projects;
use App\Models\Roles;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->department = Departments::firstOrCreate([
        'department_name' => 'Land Acquisition Branch',
    ], [
        'dep_code' => 'LAB',
        'dep_head' => 'Branch Head',
        'email' => 'lab@lams.gov.lk',
        'phone' => '+94 91 223 4567',
        'staff' => 10,
        'status' => true,
    ]);

    $this->doRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer']);
    $this->sasRole = Roles::firstOrCreate(['role_name' => 'SAS'], ['description' => 'Senior Assistant Secretary']);

    $this->doUser = User::factory()->create([
        'name' => 'Test DO Officer',
        'email' => 'do@lams.gov.lk',
        'phone' => '0771234567',
        'notification_preference' => 'both',
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
    ]);

    $this->sasUser = User::factory()->create([
        'name' => 'Test SAS Officer',
        'email' => 'sas@lams.gov.lk',
        'phone' => '0779876543',
        'notification_preference' => 'email',
        'department_id' => $this->department->id,
        'role_id' => $this->sasRole->id,
    ]);

    // Create a project created 3 months ago
    $this->project = Projects::create([
        'project_id' => 'PRJ-ACQ-TEST',
        'title' => 'Southern Expressway Expansion',
        'purpose' => 'Road Widening',
        'institution' => 'RDA',
        'department_id' => $this->department->id,
        'submitted_by' => $this->doUser->id,
    ]);

    DB::table('projects')
        ->where('id', $this->project->id)
        ->update([
            'created_at' => Carbon::now()->subMonths(3)->subDays(2),
            'updated_at' => Carbon::now()->subMonths(3)->subDays(2),
        ]);

    $this->project->refresh();
});

test('command sends 1st reminder to DO at 3-month milestone', function () {
    Notification::fake();

    $this->artisan('lams:send-checklist-reminders')
        ->assertSuccessful();

    // Verify ProjectChecklistReminder was created
    $reminder = ProjectChecklistReminder::where('project_id', $this->project->id)
        ->where('milestone_months', 3)
        ->first();

    expect($reminder)->not->toBeNull();
    expect($reminder->status)->toBe('pending_do');
    expect($reminder->first_reminder_sent_at)->not->toBeNull();
    expect($reminder->second_reminder_sent_at)->toBeNull();
    expect($reminder->escalated_to_sas_at)->toBeNull();

    // Verify DO received in-app notification
    Notification::assertSentTo($this->doUser, RealtimeSystemNotification::class, function ($notification) {
        return $notification->notificationCategory === 'checklist_reminder';
    });
});

test('DO updating progress in MarkProgress resolves pending reminder', function () {
    // 1st reminder is sent
    $this->artisan('lams:send-checklist-reminders')->assertSuccessful();

    $reminder = ProjectChecklistReminder::where('project_id', $this->project->id)->first();
    expect($reminder->status)->toBe('pending_do');

    // DO saves progress with an item checked or remarks added
    $stages = [
        [
            'id' => 1,
            'name' => 'Section 2 Order',
            'items' => [
                [
                    'id' => 'chk-1-1',
                    'title' => 'Requisition Form Received',
                    'isCompleted' => true,
                    'remarks' => 'Completed survey coordination',
                ],
            ],
        ],
    ];

    $response = $this->actingAs($this->doUser)
        ->postJson("/api/projects/{$this->project->id}/progress", [
            'stages' => $stages,
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('reminder.status', 'resolved');

    $reminder->refresh();
    expect($reminder->status)->toBe('resolved');
    expect($reminder->progress_updated_at)->not->toBeNull();

    // Running command again should NOT send second reminder or escalate
    $this->artisan('lams:send-checklist-reminders')->assertSuccessful();
    $reminder->refresh();
    expect($reminder->second_reminder_sent_at)->toBeNull();
    expect($reminder->escalated_to_sas_at)->toBeNull();
});

test('command sends 2nd notice to DO if progress not updated within 1 week of 1st reminder', function () {
    Notification::fake();

    // 1st reminder was sent 8 days ago
    $reminder = ProjectChecklistReminder::create([
        'project_id' => $this->project->id,
        'milestone_months' => 3,
        'do_user_id' => $this->doUser->id,
        'first_reminder_sent_at' => Carbon::now()->subDays(8),
        'status' => 'pending_do',
    ]);

    $this->artisan('lams:send-checklist-reminders')
        ->assertSuccessful();

    $reminder->refresh();
    expect($reminder->status)->toBe('second_reminder_sent');
    expect($reminder->second_reminder_sent_at)->not->toBeNull();
    expect($reminder->escalated_to_sas_at)->toBeNull();

    // DO received 2nd urgent notification
    Notification::assertSentTo($this->doUser, RealtimeSystemNotification::class, function ($notification) {
        return $notification->notificationCategory === 'checklist_second_reminder';
    });
});

test('command escalates to SAS by preferred medium if 2nd notice is ignored for 1 week', function () {
    Notification::fake();

    // 1st reminder was sent 15 days ago, 2nd reminder was sent 8 days ago
    $reminder = ProjectChecklistReminder::create([
        'project_id' => $this->project->id,
        'milestone_months' => 3,
        'do_user_id' => $this->doUser->id,
        'first_reminder_sent_at' => Carbon::now()->subDays(15),
        'second_reminder_sent_at' => Carbon::now()->subDays(8),
        'status' => 'second_reminder_sent',
    ]);

    $this->artisan('lams:send-checklist-reminders')
        ->assertSuccessful();

    $reminder->refresh();
    expect($reminder->status)->toBe('escalated_to_sas');
    expect($reminder->escalated_to_sas_at)->not->toBeNull();
    expect($reminder->sas_user_id)->toBe($this->sasUser->id);

    // SAS received escalation notification
    Notification::assertSentTo($this->sasUser, RealtimeSystemNotification::class, function ($notification) {
        return $notification->notificationCategory === 'checklist_escalation';
    });
});

test('DO updating progress on an escalated case resolves the reminder and notifies SAS', function () {
    Notification::fake();

    $reminder = ProjectChecklistReminder::create([
        'project_id' => $this->project->id,
        'milestone_months' => 3,
        'do_user_id' => $this->doUser->id,
        'first_reminder_sent_at' => Carbon::now()->subDays(16),
        'second_reminder_sent_at' => Carbon::now()->subDays(9),
        'escalated_to_sas_at' => Carbon::now()->subDays(1),
        'sas_user_id' => $this->sasUser->id,
        'status' => 'escalated_to_sas',
    ]);

    // DO submits progress update
    $stages = [
        [
            'id' => 1,
            'name' => 'Section 2 Order',
            'items' => [
                [
                    'id' => 'chk-1-1',
                    'title' => 'Requisition Form',
                    'isCompleted' => true,
                    'remarks' => 'Resolved after escalation',
                ],
            ],
        ],
    ];

    $this->actingAs($this->doUser)
        ->postJson("/api/projects/{$this->project->id}/progress", [
            'stages' => $stages,
        ])
        ->assertStatus(200);

    $reminder->refresh();
    expect($reminder->status)->toBe('resolved');
    expect($reminder->progress_updated_at)->not->toBeNull();

    // SAS notified that the DO resolved the case
    Notification::assertSentTo($this->sasUser, RealtimeSystemNotification::class, function ($notification) {
        return $notification->notificationCategory === 'checklist_resolved';
    });
});
