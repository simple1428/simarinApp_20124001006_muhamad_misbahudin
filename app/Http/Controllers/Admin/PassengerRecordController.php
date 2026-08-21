<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PassengerRecord;
use App\Http\Requests\StorePassengerRecordRequest;
use App\Http\Requests\UpdatePassengerRecordRequest;
use App\Models\Ship;

class PassengerRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StorePassengerRecordRequest $request
    ) {

        $ship = Ship::findOrFail(
            $request->ship_id
        );


        PassengerRecord::create([

            'ship_id' => $ship->id,

            'shipping_route_id' =>
            $request->shipping_route_id,

            'tanggal' =>
            $request->tanggal,

            'jumlah_penumpang' =>
            $request->jumlah_penumpang,

            'capacity_snapshot' =>
            $ship->kapasitas,

            'created_by' => auth()->user->id(),

        ]);


        return redirect()
            ->route('admin.passenger-records.index')
            ->with(
                'success',
                'Data aktivitas berhasil disimpan.'
            );
    }

    /**
     * Display the specified resource.
     */
    public function show(PassengerRecord $passengerRecord)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PassengerRecord $passengerRecord)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePassengerRecordRequest $request, PassengerRecord $passengerRecord)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PassengerRecord $passengerRecord)
    {
        //
    }
}
