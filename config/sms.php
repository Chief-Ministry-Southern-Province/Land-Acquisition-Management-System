<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default SMS Gateway Driver
    |--------------------------------------------------------------------------
    |
    | Supported drivers: "log", "textit", "generic_http"
    |
    */

    'default' => env('SMS_DRIVER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | SMS Enabled Flag
    |--------------------------------------------------------------------------
    |
    | Easily enable or disable SMS notifications globally across the system.
    |
    */

    'enabled' => env('SMS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Sender Identification
    |--------------------------------------------------------------------------
    |
    | Default sender ID or title used when dispatching messages.
    |
    */

    'from' => env('SMS_FROM_NAME', 'LAM System'),

    /*
    |--------------------------------------------------------------------------
    | SMS Gateway Drivers Credentials & Configuration
    |--------------------------------------------------------------------------
    |
    */

    'gateways' => [

        'log' => [
            'channel' => env('SMS_LOG_CHANNEL', null),
        ],

        'textit' => [
            'username' => env('TEXTIT_USERNAME', env('TEXTIT_USER_ID')),
            'password' => env('TEXTIT_PASSWORD'),
            'endpoint' => env('TEXTIT_ENDPOINT', 'https://www.textit.biz/sendmsg'),
        ],

        'generic_http' => [
            'url' => env('SMS_GATEWAY_URL'),
            'api_key' => env('SMS_GATEWAY_API_KEY'),
            'method' => env('SMS_GATEWAY_METHOD', 'POST'),
            'to_param' => env('SMS_GATEWAY_TO_PARAM', 'to'),
            'message_param' => env('SMS_GATEWAY_MESSAGE_PARAM', 'message'),
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
        ],

    ],

];
