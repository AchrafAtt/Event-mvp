<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class DashboardController extends Controller
{
    /**
     * Ancienne URL /admin/dashboard : redirige vers le tableau de bord unifié.
     */
    public function index(): RedirectResponse
    {
        return redirect()->route('dashboard');
    }
}
