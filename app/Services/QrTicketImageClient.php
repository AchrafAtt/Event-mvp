<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class QrTicketImageClient
{
    /**
     * @return string Raw PNG bytes
     */
    public function generatePng(string $data, string $foreground = '#E91E63', string $background = '#FFFFFF'): string
    {
        $baseUrl = rtrim((string) config('services.qr_ticket.url'), '/');
        if ($baseUrl === '') {
            throw new RuntimeException('QR ticket service URL is not configured.');
        }

        $key = (string) config('services.qr_ticket.key');
        $timeout = (int) config('services.qr_ticket.timeout', 10);

        $response = Http::withHeaders([
            'X-Api-Key' => $key,
            'Accept' => 'application/json',
        ])
            ->timeout($timeout)
            ->post($baseUrl.'/generate', [
                'data' => $data,
                'foreground' => $foreground,
                'background' => $background,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('QR ticket service returned HTTP '.$response->status());
        }

        $imageBase64 = $response->json('image_base64');
        if (! is_string($imageBase64) || $imageBase64 === '') {
            throw new RuntimeException('QR ticket service response missing image_base64.');
        }

        $binary = base64_decode($imageBase64, true);
        if ($binary === false || $binary === '') {
            throw new RuntimeException('QR ticket service returned invalid base64.');
        }

        return $binary;
    }
}
