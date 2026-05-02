<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::emailVerification());
});

test('sends verification notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('home'));

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('does not send verification notification if email is verified for a client', function () {
    Notification::fake();

    $user = User::factory()->create(['role' => 'client']);

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('reservations.index', absolute: false));

    Notification::assertNothingSent();
});

test('does not send verification notification if email is verified for an admin', function () {
    Notification::fake();

    $user = User::factory()->admin()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});
