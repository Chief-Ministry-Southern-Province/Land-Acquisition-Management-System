<?php

namespace Tests\Unit;

use App\Models\Projects;
use App\Models\User;
use App\Services\EmailService;
use App\Services\SmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class NotificationPreferenceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('sms.enabled', true);
        Config::set('sms.default', 'log');
    }

    public function test_should_send_email_and_sms_helpers()
    {
        $userEmail = new User(['notification_preference' => 'email']);
        $userSms = new User(['notification_preference' => 'sms']);
        $userBoth = new User(['notification_preference' => 'both']);
        $userNone = new User(['notification_preference' => 'none']);

        $this->assertTrue(EmailService::shouldSendEmail($userEmail));
        $this->assertFalse(EmailService::shouldSendSms($userEmail));

        $this->assertFalse(EmailService::shouldSendEmail($userSms));
        $this->assertTrue(EmailService::shouldSendSms($userSms));

        $this->assertTrue(EmailService::shouldSendEmail($userBoth));
        $this->assertTrue(EmailService::shouldSendSms($userBoth));

        $this->assertFalse(EmailService::shouldSendEmail($userNone));
        $this->assertFalse(EmailService::shouldSendSms($userNone));
    }

    public function test_sms_service_skips_when_user_preference_is_none()
    {
        Log::shouldReceive('info')->once()->withArgs(function ($msg) {
            return str_contains($msg, "Notification preference is 'none'");
        });

        $user = new User([
            'id' => 999,
            'notification_preference' => 'none',
        ]);

        $sent = SmsService::sendSms($user, 'Test notification message');
        $this->assertFalse($sent);
    }
}
