<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShipRequest;
use App\Http\Requests\UpdateShipRequest;
use App\Models\Ship;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShipController extends Controller
{
    public function index(): Response
    {
        $ships = Ship::query()
            ->orderBy('nama_kapal')
            ->get();

        return Inertia::render('Admin/Ships/Index', [
            'ships' => $ships,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Ships/Create');
    }

    public function store(StoreShipRequest $request): RedirectResponse
    {
        Ship::create($request->validated());

        return redirect()
            ->route('ships.index')
            ->with('success', 'Data kapal berhasil ditambahkan.');
    }

    public function edit(Ship $ship): Response
    {
        return Inertia::render('Admin/Ships/Edit', [
            'ship' => $ship,
        ]);
    }

    public function update(
        UpdateShipRequest $request,
        Ship $ship
    ): RedirectResponse {
        $ship->update($request->validated());

        return redirect()
            ->route('ships.index')
            ->with('success', 'Data kapal berhasil diperbarui.');
    }

    public function toggleStatus(Ship $ship): RedirectResponse
    {
        $ship->update([
            'status' => $ship->status === 'aktif'
                ? 'nonaktif'
                : 'aktif',
        ]);

        return redirect()
            ->route('ships.index');
    }
}
