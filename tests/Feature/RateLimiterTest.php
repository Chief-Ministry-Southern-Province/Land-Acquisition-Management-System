<?php

use App\Models\Departments;
use App\Models\Roles;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use App\Services\RateLimiterService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Cache::flush();

    $this->department = Departments::firstOrCreate([
        'department_name' => 'Land Administration',
    ], [
        'dep_code' => 'LA',
        'dep_head' => 'Admin Officer',
        'email' => 'la@lams.gov.lk',
        'phone' => '+94 11 234 5678',
        'staff' => 5,
        'status' => true,
    ]);

    $this->adminRole = Roles::firstOrCreate(['role_name' => 'Admin'], ['description' => 'Administrator']);
    $this->doRole = Roles::firstOrCreate(['role_name' => 'DO'], ['description' => 'Development Officer']);

    $this->admin = User::factory()->create([
        'name' => 'System Admin',
        'email' => 'admin@lams.gov.lk',
        'department_id' => $this->department->id,
        'role_id' => $this->adminRole->id,
        'status' => 'active',
    ]);

    $this->officerA = User::factory()->create([
        'name' => 'Officer A',
        'email' => 'officerA@lams.gov.lk',
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
        'status' => 'active',
    ]);

    $this->officerB = User::factory()->create([
        'name' => 'Officer B',
        'email' => 'officerB@lams.gov.lk',
        'department_id' => $this->department->id,
        'role_id' => $this->doRole->id,
        'status' => 'active',
    ]);
});

test('login attempts are limited to 5 per minute and 20 per hour', function () {
    Notification::fake();

    $payload = [
        'email' => 'wrong@test.com',
        'password' => 'wrongpass',
    ];

    // 5 attempts should go through to the controller (even if credentials invalid)
    for ($i = 1; $i <= 5; $i++) {
        $response = $this->postJson('/api/auth/login', $payload);
        $this->assertNotEquals(429, $response->status(), "Attempt {$i} should not be 429");
    }

    // 6th attempt must be blocked with HTTP 429
    $blocked = $this->postJson('/api/auth/login', $payload);
    $blocked->assertStatus(429);
    $blocked->assertJsonPath('error', 'rate_limit_exceeded');
    $blocked->assertJsonPath('blocked', true);
    $this->assertTrue($blocked->headers->has('Retry-After'));

    // Admin should have received a notification
    Notification::assertSentTo($this->admin, RealtimeSystemNotification::class, function ($n) {
        return str_contains($n->message, 'Login attempts rate limit') || str_contains($n->title, 'Rate Limit Exceeded');
    });
});

test('password reset requests are limited to 3 per minute', function () {
    Notification::fake();

    $payload = ['email' => 'nonexistent@test.com'];

    for ($i = 1; $i <= 3; $i++) {
        $response = $this->postJson('/api/auth/forgot-password', $payload);
        $this->assertNotEquals(429, $response->status(), "Attempt {$i} should not be 429");
    }

    $blocked = $this->postJson('/api/auth/forgot-password', $payload);
    $blocked->assertStatus(429);
    $blocked->assertJsonPath('blocked', true);
});

test('report generation and export endpoints are limited to 5 per minute', function () {
    Notification::fake();

    for ($i = 1; $i <= 5; $i++) {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/projects/export');
        $this->assertNotEquals(429, $response->status(), "Export request {$i} should not be 429");
    }

    $blocked = $this->actingAs($this->admin, 'sanctum')->getJson('/api/projects/export');
    $blocked->assertStatus(429);
    $blocked->assertJsonPath('blocked', true);
    $this->assertStringContainsString('Report generation and exports', $blocked->json('operation'));
});

test('document uploads are limited to 10 per minute', function () {
    Storage::fake('local');
    Notification::fake();

    for ($i = 1; $i <= 10; $i++) {
        $file = UploadedFile::fake()->create("doc_{$i}.pdf", 100);
        $response = $this->actingAs($this->officerA, 'sanctum')->postJson('/api/documents', [
            'document_name' => "Document {$i}",
            'document_type' => 'Section 2',
            'file' => $file,
        ]);
        $this->assertNotEquals(429, $response->status(), "Upload {$i} should not be 429");
    }

    $fileExtra = UploadedFile::fake()->create('extra.pdf', 100);
    $blocked = $this->actingAs($this->officerA, 'sanctum')->postJson('/api/documents', [
        'document_name' => 'Extra Document',
        'document_type' => 'Section 2',
        'file' => $fileExtra,
    ]);

    $blocked->assertStatus(429);
    $blocked->assertJsonPath('blocked', true);
});

test('create, update, and delete records are limited to 30 per minute', function () {
    Notification::fake();

    $projectPayload = [
        'project_id' => 'PRJ-RT-01',
        'purpose' => 'Expressway',
    ];

    for ($i = 1; $i <= 30; $i++) {
        $projectPayload['project_id'] = "PRJ-RT-{$i}";
        $response = $this->actingAs($this->officerA, 'sanctum')->postJson('/api/projects', $projectPayload);
        $this->assertNotEquals(429, $response->status(), "CUD request {$i} should not be 429");
    }

    $projectPayload['project_id'] = 'PRJ-RT-31';
    $blocked = $this->actingAs($this->officerA, 'sanctum')->postJson('/api/projects', $projectPayload);
    $blocked->assertStatus(429);
    $blocked->assertJsonPath('blocked', true);
});

test('search and filtering requests are limited to 60 per minute', function () {
    Notification::fake();

    for ($i = 1; $i <= 60; $i++) {
        $response = $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects?search=Galle');
        $this->assertNotEquals(429, $response->status(), "Search request {$i} should not be 429");
    }

    $blocked = $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects?search=Galle');
    $blocked->assertStatus(429);
    $blocked->assertJsonPath('blocked', true);
    $this->assertStringContainsString('Search and filtering', $blocked->json('operation'));
});

test('each authenticated officer receives an independent allowance', function () {
    Notification::fake();

    // Officer A exhausts 5 export requests and gets blocked on 6th
    for ($i = 1; $i <= 5; $i++) {
        $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    }
    $blockedA = $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    $blockedA->assertStatus(429);

    // Officer B still has their full independent allowance
    $responseB = $this->actingAs($this->officerB, 'sanctum')->getJson('/api/projects/export');
    $responseB->assertStatus(200);
});

test('temporarily blocked user cannot perform other activities', function () {
    Notification::fake();

    // Officer A triggers block on exports
    for ($i = 1; $i <= 5; $i++) {
        $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    }
    $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export')->assertStatus(429);

    // Officer A is now temporarily blocked; even general GET requests must be blocked
    $generalRequest = $this->actingAs($this->officerA, 'sanctum')->getJson('/api/test');
    $generalRequest->assertStatus(429);
    $generalRequest->assertJsonPath('blocked', true);
});

test('system administrator is notified and audit log created when limit is exceeded', function () {
    Notification::fake();

    for ($i = 1; $i <= 5; $i++) {
        $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    }
    $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export')->assertStatus(429);

    // Verify RealtimeSystemNotification sent to Admin
    Notification::assertSentTo($this->admin, RealtimeSystemNotification::class, function ($notification) {
        return str_contains($notification->message, 'Officer A')
            && str_contains($notification->message, 'temporarily blocked');
    });

    // Verify Audit Log was recorded
    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->officerA->id,
        'action' => 'Rate Limit Exceeded - Temporary Block',
        'module' => 'Security',
    ]);
});

test('subsequent blocked requests do not spam administrator with duplicate notifications', function () {
    Notification::fake();

    // Trigger block
    for ($i = 1; $i <= 6; $i++) {
        $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    }

    // Make 5 more requests while blocked
    for ($i = 1; $i <= 5; $i++) {
        $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    }

    // Admin should have received exactly 1 notification, not 6
    Notification::assertSentToTimes($this->admin, RealtimeSystemNotification::class, 1);
});

test('administrator can manually unblock a temporarily blocked user', function () {
    Notification::fake();

    // Trigger block on Officer A
    for ($i = 1; $i <= 6; $i++) {
        $this->actingAs($this->officerA, 'sanctum')->getJson('/api/projects/export');
    }

    // Verify Officer A is blocked
    $this->assertTrue(RateLimiterService::isUserBlocked($this->officerA->id));

    // Admin checks blocked status via API
    $statusResponse = $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/users/{$this->officerA->id}/blocked-status");
    $statusResponse->assertStatus(200);
    $statusResponse->assertJsonPath('is_blocked', true);

    // Admin unblocks Officer A via API
    $unblockResponse = $this->actingAs($this->admin, 'sanctum')
        ->postJson("/api/users/{$this->officerA->id}/unblock");
    $unblockResponse->assertStatus(200);
    $unblockResponse->assertJsonPath('message', "User {$this->officerA->name} unblocked successfully");

    // Officer A is now unblocked and can make requests again
    $this->assertFalse(RateLimiterService::isUserBlocked($this->officerA->id));
    $retry = $this->actingAs($this->officerA, 'sanctum')->getJson('/api/test');
    $retry->assertStatus(200);
});

test('passing requests receive rate limit headers', function () {
    $response = $this->actingAs($this->officerA, 'sanctum')->getJson('/api/test');

    $response->assertStatus(200);
    $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
    $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
    $this->assertTrue($response->headers->has('X-RateLimit-Reset'));
});
