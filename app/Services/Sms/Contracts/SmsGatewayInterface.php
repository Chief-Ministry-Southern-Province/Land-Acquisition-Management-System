<?php

namespace App\Services\Sms\Contracts;

interface SmsGatewayInterface
{
    /**
     * Send an SMS message to recipient(s).
     *
     * @param  string  $to  Recipient phone number
     * @param  string  $message  Text message content
     * @param  array  $options  Additional gateway options (e.g. sender ID, custom reference)
     * @return bool True on successful dispatch, false on failure
     */
    public function send(string $to, string $message, array $options = []): bool;

    /**
     * Get the name identifier of the SMS Gateway driver.
     */
    public function getName(): string;
}
