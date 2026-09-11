<?php

namespace App\Services\Sms\Gateways;

use App\Services\Sms\Contracts\SmsGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenericHttpGateway implements SmsGatewayInterface
{
    protected array $config;

    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    public function send(string $to, string $message, array $options = []): bool
    {
        $url = $this->config['url'] ?? config('sms.gateways.generic_http.url');
        $apiKey = $this->config['api_key'] ?? config('sms.gateways.generic_http.api_key');
        $method = strtoupper($options['method'] ?? $this->config['method'] ?? config('sms.gateways.generic_http.method', 'POST'));
        $toParam = $this->config['to_param'] ?? config('sms.gateways.generic_http.to_param', 'to');
        $messageParam = $this->config['message_param'] ?? config('sms.gateways.generic_http.message_param', 'message');
        $headers = array_merge(
            $this->config['headers'] ?? config('sms.gateways.generic_http.headers', []),
            $options['headers'] ?? []
        );

        if (empty($url)) {
            Log::error("GenericHttp SMS failed: Missing SMS Gateway Endpoint URL.");
            return false;
        }

        $payload = [
            $toParam => $to,
            $messageParam => $message,
        ];

        if (!empty($apiKey)) {
            $payload['api_key'] = $apiKey;
        }

        if (!empty($options['extra_params']) && is_array($options['extra_params'])) {
            $payload = array_merge($payload, $options['extra_params']);
        }

        try {
            $httpClient = Http::withHeaders($headers);

            if ($method === 'GET') {
                $response = $httpClient->get($url, $payload);
            } else {
                $response = $httpClient->post($url, $payload);
            }

            if ($response->successful()) {
                Log::info("GenericHttp SMS sent successfully to {$to}", [
                    'status' => $response->status(),
                ]);
                return true;
            }

            Log::error("GenericHttp SMS dispatch failed: HTTP {$response->status()}", [
                'to' => $to,
                'response' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error("GenericHttp SMS exception: {$e->getMessage()}", [
                'to' => $to,
                'exception' => $e,
            ]);

            return false;
        }
    }

    public function getName(): string
    {
        return 'generic_http';
    }
}
