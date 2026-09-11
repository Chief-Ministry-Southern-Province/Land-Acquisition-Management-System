<?php

namespace App\Services\Sms\Gateways;

use App\Services\Sms\Contracts\SmsGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TextItGateway implements SmsGatewayInterface
{
    protected array $config;

    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    public function send(string $to, string $message, array $options = []): bool
    {
        $username = $this->config['username'] ?? config('sms.gateways.textit.username');
        $password = $this->config['password'] ?? config('sms.gateways.textit.password');
        $endpoint = $this->config['endpoint'] ?? config('sms.gateways.textit.endpoint', 'https://www.textit.biz/sendmsg');

        if (empty($username) || empty($password)) {
            Log::error("TextIt SMS failed: Missing Username/Account ID or Password.");
            return false;
        }

        try {
            $response = Http::get($endpoint, [
                'id' => $username,
                'pw' => $password,
                'to' => $to,
                'text' => $message,
            ]);

            $body = $response->body();

            if ($response->successful() && (str_contains(strtoupper($body), 'OK') || preg_match('/^\d+/', trim($body)))) {
                Log::info("TextIt SMS sent successfully to {$to}", [
                    'response' => $body,
                ]);
                return true;
            }

            Log::error("TextIt SMS dispatch failed: HTTP {$response->status()}", [
                'to' => $to,
                'response' => $body,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error("TextIt SMS exception: {$e->getMessage()}", [
                'to' => $to,
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function getName(): string
    {
        return 'textit';
    }
}
