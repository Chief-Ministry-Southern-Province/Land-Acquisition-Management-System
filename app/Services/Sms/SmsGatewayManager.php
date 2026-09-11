<?php

namespace App\Services\Sms;

use App\Services\Sms\Contracts\SmsGatewayInterface;
use App\Services\Sms\Gateways\GenericHttpGateway;
use App\Services\Sms\Gateways\LogGateway;
use App\Services\Sms\Gateways\TextItGateway;

class SmsGatewayManager
{
    /**
     * Array of resolved driver instances.
     *
     * @var array<string, SmsGatewayInterface>
     */
    protected array $drivers = [];

    /**
     * Get an SMS gateway driver instance.
     *
     * @param string|null $name
     * @return SmsGatewayInterface
     */
    public function driver(?string $name = null): SmsGatewayInterface
    {
        $name = $name ?: config('sms.default', 'log');

        if (!isset($this->drivers[$name])) {
            $this->drivers[$name] = $this->resolve($name);
        }

        return $this->drivers[$name];
    }

    /**
     * Resolve the requested SMS Gateway driver.
     *
     * @param string $name
     * @return SmsGatewayInterface
     */
    protected function resolve(string $name): SmsGatewayInterface
    {
        $config = config("sms.gateways.{$name}", []);

        return match ($name) {
            'log' => new LogGateway($config),
            'textit', 'text_it' => new TextItGateway($config),
            'generic_http', 'generic' => new GenericHttpGateway($config),
            default => new LogGateway($config),
        };
    }

    /**
     * Register a custom gateway driver instance or closure.
     *
     * @param string $name
     * @param SmsGatewayInterface $driver
     * @return void
     */
    public function extend(string $name, SmsGatewayInterface $driver): void
    {
        $this->drivers[$name] = $driver;
    }
}
