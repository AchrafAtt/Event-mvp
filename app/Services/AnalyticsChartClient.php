<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AnalyticsChartClient
{
    /**
     * @param  array<string, mixed>  $payload  Output of ReportingSnapshot::build()
     * @return string Raw PNG or PDF bytes
     */
    public function render(array $payload, string $format): string
    {
        $format = strtolower($format);
        if (! in_array($format, ['png', 'pdf'], true)) {
            throw new RuntimeException('Invalid analytics format.');
        }

        $baseUrl = rtrim((string) config('services.analytics.url'), '/');
        if ($baseUrl === '') {
            throw new RuntimeException('Analytics service URL is not configured.');
        }

        $key = (string) config('services.analytics.key');
        $timeout = (int) config('services.analytics.timeout', 30);

        $response = Http::withHeaders([
            'X-Api-Key' => $key,
            'Accept' => 'application/json',
        ])
            ->timeout($timeout)
            ->post($baseUrl.'/render', [
                'format' => $format,
                'payload' => $payload,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Analytics service returned HTTP '.$response->status(),
            );
        }

        $encoded = $response->json('content_base64');
        if (! is_string($encoded) || $encoded === '') {
            throw new RuntimeException('Analytics response missing content_base64.');
        }

        $binary = base64_decode($encoded, true);
        if ($binary === false || $binary === '') {
            throw new RuntimeException('Analytics service returned invalid base64.');
        }

        return $binary;
    }
}
