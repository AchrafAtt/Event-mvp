<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Booking / contact
    |--------------------------------------------------------------------------
    |
    | WhatsApp business number for client CTAs (digits only, with country code,
    | e.g. 212612345678). Used on the reservation confirmation page.
    |
    */

    'whatsapp_phone' => env('WHATSAPP_PHONE'),

    /*
    |--------------------------------------------------------------------------
    | QR ticket microservice (Python FastAPI, see services/qr-ticket/)
    |--------------------------------------------------------------------------
    */

    'qr_ticket' => [
        'url' => env('QR_TICKET_SERVICE_URL'),
        'key' => env('QR_TICKET_SERVICE_KEY'),
        'timeout' => (int) env('QR_TICKET_TIMEOUT', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Analytics chart service (Python FastAPI, see services/analytics/)
    |--------------------------------------------------------------------------
    */

    'analytics' => [
        'url' => env('ANALYTICS_SERVICE_URL'),
        'key' => env('ANALYTICS_SERVICE_KEY'),
        'timeout' => (int) env('ANALYTICS_TIMEOUT', 30),
    ],

];
