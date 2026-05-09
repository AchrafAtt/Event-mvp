<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsChartClient;
use App\Services\ReportingSnapshot;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReportsController extends Controller
{
    /**
     * Formulaire et aperçu des métriques agrégées exportables.
     */
    public function index(Request $request, ReportingSnapshot $reportingSnapshot): Response
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        [$start, $end] = $this->resolveDateRange($request);

        return Inertia::render('admin/reports/index', [
            'snapshot' => $reportingSnapshot->build($start, $end),
            'filters' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ],
            'analyticsConfigured' => rtrim((string) config('services.analytics.url'), '/') !== '',
        ]);
    }

    /**
     * Génère PNG ou PDF via le microservice Python.
     */
    public function export(Request $request, ReportingSnapshot $reportingSnapshot, AnalyticsChartClient $analyticsChartClient): SymfonyResponse
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        if (rtrim((string) config('services.analytics.url'), '/') === '') {
            return redirect()->route('admin.reports.index', $request->only(['start_date', 'end_date']))
                ->withErrors([
                    'analytics' => 'Le service analytics n’est pas configuré (ANALYTICS_SERVICE_URL).',
                ]);
        }

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date'],
            'format' => ['required', Rule::in(['png', 'pdf'])],
        ], [], [
            'start_date' => 'date de début',
            'end_date' => 'date de fin',
            'format' => 'format',
        ]);

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end = Carbon::parse($validated['end_date'])->endOfDay();

        if ($start->greaterThan($end)) {
            return redirect()
                ->route('admin.reports.index', ['start_date' => $validated['start_date'], 'end_date' => $validated['end_date']])
                ->withErrors(['end_date' => 'La date de fin doit être après la date de début.'])
                ->withInput();
        }

        $payload = $reportingSnapshot->build($start, $end);

        try {
            $binary = $analyticsChartClient->render($payload, $validated['format']);
        } catch (\Throwable $e) {
            return redirect()
                ->route('admin.reports.index', ['start_date' => $validated['start_date'], 'end_date' => $validated['end_date']])
                ->withErrors(['export' => 'Échec du rendu : '.$e->getMessage()])
                ->withInput();
        }

        $slug = $start->format('Ymd').'-'.$end->format('Ymd');

        if ($validated['format'] === 'pdf') {
            $filename = 'rapport-analytics-'.$slug.'.pdf';

            return response($binary, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        }

        $filename = 'rapport-analytics-'.$slug.'.png';

        return response($binary, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveDateRange(Request $request): array
    {
        $defaults = [
            'start' => now()->subDays(365)->startOfDay(),
            'end' => now()->endOfDay(),
        ];

        if ($request->filled(['start_date', 'end_date'])) {
            $start = Carbon::parse($request->query('start_date'))->startOfDay();
            $end = Carbon::parse($request->query('end_date'))->endOfDay();
            if ($start->greaterThan($end)) {
                return [$defaults['start'], $defaults['end']];
            }

            return [$start, $end];
        }

        return [$defaults['start'], $defaults['end']];
    }
}
