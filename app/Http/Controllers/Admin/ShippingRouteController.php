<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PassengerRecord;
use App\Models\ShippingRoute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingRouteController extends Controller
{
    public function index(): Response
    {
        $routes = ShippingRoute::all()->map(function ($route) {
            $records = PassengerRecord::where('shipping_route_id', $route->id);
            $totalTrips = (int) $records->count();
            $totalPax = (int) $records->sum('jumlah_penumpang');

            return [
                'id' => $route->id,
                'asal' => $route->asal,
                'tujuan' => $route->tujuan,
                'route_label' => "{$route->asal} ⇄ {$route->tujuan}",
                'status' => $route->status ?? 'aktif',
                'total_trips' => $totalTrips,
                'total_passengers' => $totalPax,
                'created_at' => $route->created_at ? $route->created_at->format('d M Y') : '-',
            ];
        });

        $totalTripsAll = $routes->sum('total_trips');
        $totalPaxAll = $routes->sum('total_passengers');

        return Inertia::render('Admin/ShippingRoutes/Index', [
            'routes' => $routes,
            'stats' => [
                'total_routes' => $routes->count(),
                'active_routes' => $routes->where('status', 'aktif')->count(),
                'total_trips' => $totalTripsAll,
                'total_passengers' => $totalPaxAll,
            ],
        ]);
    }

    public function edit(ShippingRoute $shippingRoute): Response
    {
        return Inertia::render('Admin/ShippingRoutes/Edit', [
            'route' => $shippingRoute,
        ]);
    }

    public function update(
        Request $request,
        ShippingRoute $shippingRoute
    ): RedirectResponse {
        $validated = $request->validate([
            'asal' => 'required|string|max:100',
            'tujuan' => 'required|string|max:100',
        ]);

        $shippingRoute->update([
            'asal' => $validated['asal'],
            'tujuan' => $validated['tujuan'],
        ]);

        return redirect()
            ->route('shipping-routes.index')
            ->with('success', "Penamaan rute penyeberangan {$shippingRoute->asal} → {$shippingRoute->tujuan} berhasil diperbarui.");
    }
}
