<?php

namespace Tests\Unit;

use App\Models\Projects;
use App\Models\User;
use App\Services\Sms\Contracts\SmsGatewayInterface;
use App\Services\Sms\Gateways\GenericHttpGateway;
use App\Services\Sms\Gateways\LogGateway;
use App\Services\Sms\Gateways\TextItGateway;
use App\Services\Sms\SmsGatewayManager;
use App\Services\SmsService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class SmsServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Config::set('sms.enabled', true);
        Config::set('sms.default', 'log');
    }

    public function test_sanitize_phone_number()
    {
        $this->assertEquals('+94771234567', SmsService::sanitizePhone('+94 (77) 123-4567'));
        $this->assertEquals('0771234567', SmsService::sanitizePhone('077 123 4567'));
        $this->assertNull(SmsService::sanitizePhone('   '));
    }

    public function test_log_gateway_dispatches_sms()
    {
        Log::shouldReceive('channel')->with(null)->andReturnSelf();
        Log::shouldReceive('info')->once()->withArgs(function ($msg, $context) {
            return str_contains($msg, 'SMS Dispatched') && $context['to'] === '+94771234567';
        });

        $result = SmsService::sendSms('+94771234567', 'Test SMS Message', 'log');
        $this->assertTrue($result);
    }

    public function test_disabled_sms_config_returns_false()
    {
        Config::set('sms.enabled', false);

        $result = SmsService::sendSms('+94771234567', 'Test SMS');
        $this->assertFalse($result);
    }

    public function test_textit_gateway_dispatches_http_request()
    {
        Http::fake([
            'https://api.textit.biz/*' => Http::response(['status' => 'success'], 200),
        ]);

        Config::set('sms.gateways.textit', [
            'api_key'  => 'eyJhbGciOiJIUzUxMiJ9.testkey',
            'endpoint' => 'https://api.textit.biz/',
        ]);

        $gateway = new TextItGateway();
        // Pass number with '+' — gateway must strip it before sending
        $sent = $gateway->send('+94771234567', 'TextIt Test Message');

        $this->assertTrue($sent);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'api.textit.biz')
                && $request->hasHeader('Authorization', 'Basic eyJhbGciOiJIUzUxMiJ9.testkey')
                && $request->hasHeader('X-API-VERSION', 'v1')
                && $request['to'] === '94771234567'
                && $request['text'] === 'TextIt Test Message';
        });
    }

    public function test_generic_http_gateway_dispatches_http_request()
    {
        Http::fake([
            'https://api.sms-gateway.com/send' => Http::response(['status' => 'ok'], 200),
        ]);

        Config::set('sms.gateways.generic_http', [
            'url' => 'https://api.sms-gateway.com/send',
            'api_key' => 'SECRET_KEY',
            'method' => 'POST',
            'to_param' => 'to',
            'message_param' => 'message',
        ]);

        $gateway = new GenericHttpGateway();
        $sent = $gateway->send('+94771234567', 'Generic HTTP Test Message');

        $this->assertTrue($sent);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.sms-gateway.com/send'
                && $request['to'] === '+94771234567'
                && $request['message'] === 'Generic HTTP Test Message'
                && $request['api_key'] === 'SECRET_KEY';
        });
    }

    public function test_sms_gateway_manager_resolves_and_caches_drivers()
    {
        $manager = new SmsGatewayManager();
        $logDriver = $manager->driver('log');
        $textitDriver = $manager->driver('textit');
        $genericDriver = $manager->driver('generic_http');

        $this->assertInstanceOf(LogGateway::class, $logDriver);
        $this->assertInstanceOf(TextItGateway::class, $textitDriver);
        $this->assertInstanceOf(GenericHttpGateway::class, $genericDriver);
        $this->assertSame($logDriver, $manager->driver('log'));
    }

    public function test_send_case_pending_approval_sms()
    {
        Log::shouldReceive('channel')->andReturnSelf();
        Log::shouldReceive('info')->once();

        $project = new Projects();
        $project->title = 'Test Southern Expressway Acquisition';

        $sent = SmsService::sendCasePendingApprovalSms('+94771234567', $project, 'HOB Review', 'log');
        $this->assertTrue($sent);
    }
}
