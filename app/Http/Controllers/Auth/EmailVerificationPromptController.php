<?php

namespace App\Http\Controllers\Auth;

use App\Support\AuthRedirect;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Laravel\Fortify\Contracts\VerifyEmailViewResponse;

/**
 * Fortify-compatible prompt: verified users go to role-based home (not static fortify.redirects).
 */
class EmailVerificationPromptController extends Controller
{
    public function __invoke(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(AuthRedirect::intendedHome($request->user()));
        }

        return app(VerifyEmailViewResponse::class);
    }
}
