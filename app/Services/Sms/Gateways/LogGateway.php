<?php

namespace App\Services\Sms\Gateways;

use App\Services\Sms\Contracts\SmsGatewayInterface;
use Illuminate\Support\Facades\Log;

class LogGateway implements SmsGatewayInterface
{
    protected array $config;

    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    public function send(string $to, string $message, array $options = []): bool
    {
        $channel = $this->config['channel'] ?? null;

        Log::channel($channel)->info('SMS Dispatched [LogGateway]', [
            'to' => $to,
            'message' => $message,
            'options' => $options,
            'timestamp' => now()->toIso8601String(),
        ]);

        return true;
    }

    public function getName(): string
    {
        return 'log';
    }
}
