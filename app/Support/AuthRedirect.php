<?php

namespace App\Support;

use App\Models\User;

final class AuthRedirect
{
    /**
     * Post-auth home URL: admin dashboard vs client reservations list.
     */
    public static function intendedHome(?User $user): string
    {
        if ($user === null) {
            return route('home', absolute: false);
        }

        return $user->role === 'admin'
            ? route('dashboard', absolute: false)
            : route('reservations.index', absolute: false);
    }
}
