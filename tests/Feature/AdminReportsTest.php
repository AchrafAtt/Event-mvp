<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting admin reports index', function () {
    $this->get(route('admin.reports.index'))
        ->assertRedirect(route('login'));
});

test('clients cannot access admin reports index', function () {
    $client = User::factory()->create();

    $this->actingAs($client)->get(route('admin.reports.index'))
        ->assertForbidden();
});

test('admins can view analytics reports inertia page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.reports.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/index')
            ->has('snapshot.meta')
            ->has('snapshot.revenue_by_month')
            ->has('snapshot.reservations_by_month')
            ->has('snapshot.capacity_projection')
            ->where('analyticsConfigured', true));
});

test('clients cannot export admin reports', function () {
    $client = User::factory()->create();

    $this->actingAs($client)->get(route('admin.reports.export', [
        'start_date' => now()->subMonth()->toDateString(),
        'end_date' => now()->toDateString(),
        'format' => 'png',
    ]))->assertForbidden();
});

test('admin export redirects when analytics service url is missing', function () {
    config(['services.analytics.url' => '']);

    $admin = User::factory()->admin()->create();

    $html = $this->actingAs($admin)
        ->followingRedirects()
        ->get(route('admin.reports.export', [
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->toDateString(),
            'format' => 'png',
        ]))
        ->assertOk()
        ->getContent();

    expect($html)->toContain('ANALYTICS_SERVICE_URL');
});

test('admins receive png attachment when analytics service succeeds', function () {
    Http::fake([
        'analytics.test/*' => Http::response([
            'format' => 'png',
            'content_base64' => base64_encode('fake-png-chart'),
        ], 200),
    ]);

    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.reports.export', [
        'start_date' => now()->subDays(30)->toDateString(),
        'end_date' => now()->toDateString(),
        'format' => 'png',
    ]));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('image/png');

    Http::assertSentCount(1);
});

test('admins receive pdf attachment when analytics service succeeds', function () {
    Http::fake([
        'analytics.test/*' => Http::response([
            'format' => 'pdf',
            'content_base64' => base64_encode('%PDF-test'),
        ], 200),
    ]);

    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.reports.export', [
        'start_date' => now()->subDays(30)->toDateString(),
        'end_date' => now()->toDateString(),
        'format' => 'pdf',
    ]));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});
