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
        $apiKey = $this->config['api_key']
            ?? config('sms.gateways.textit.api_key')
            ?? $this->config['password']
            ?? config('sms.gateways.textit.password');

        $endpoint = $this->config['endpoint']
            ?? config('sms.gateways.textit.endpoint', 'https://api.textit.biz/');

        $apiVersion = $this->config['api_version']
            ?? config('sms.gateways.textit.api_version', 'v1');

        $timeout = (int) ($this->config['timeout']
            ?? config('sms.gateways.textit.timeout', 15));

        if (empty($apiKey)) {
            Log::error('TextIt REST SMS failed: Missing API Key.');

            return false;
        }

        // TextIt REST API requires recipient number without '+' prefix (e.g. 94772823050).
        $recipient = ltrim($to, '+');

        // Ensure authorization header is prefixed with 'Basic '
        $authHeader = str_starts_with($apiKey, 'Basic ') ? $apiKey : 'Basic '.$apiKey;

        try {
            $payload = [
                'to' => $recipient,
                'text' => $message,
            ];

            if (! empty($options['ref'])) {
                $payload['ref'] = substr($options['ref'], 0, 15);
            }

            if (! empty($options['schd'])) {
                $payload['schd'] = $options['schd'];
            }

            $response = Http::timeout($timeout)
                ->withHeaders([
                    'Authorization' => $authHeader,
                    'Content-Type' => 'application/json',
                    'Accept' => '*/*',
                    'X-API-VERSION' => $apiVersion,
                ])->post($endpoint, $payload);

            $body = trim($response->body());

            if ($response->successful()) {
                Log::info("TextIt REST SMS sent successfully to {$recipient}", [
                    'status' => $response->status(),
                    'response' => $body,
                ]);

                return true;
            }

            Log::error("TextIt REST SMS dispatch failed: HTTP {$response->status()}", [
                'to' => $recipient,
                'response' => $body,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error("TextIt REST SMS exception: {$e->getMessage()}", [
                'to' => $recipient,
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
