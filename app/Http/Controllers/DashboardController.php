<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === 'operator') {
            return Inertia::render('Admin/Dashboard', [
                'user' => $user,
            ]);
        }

        if ($user->role === 'kepala_pelabuhan') {
            return Inertia::render('PortMaster/Dashboard', [
                'user' => $user,
            ]);
        }

        abort(403);
    }
}
