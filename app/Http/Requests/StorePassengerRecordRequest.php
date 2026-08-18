<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePassengerRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        return [

            'ship_id' => [
                'required',
                'exists:ships,id',
            ],

            'shipping_route_id' => [
                'required',
                'exists:shipping_routes,id',
            ],

            'tanggal' => [
                'required',
                'date',
            ],

            'jumlah_penumpang' => [
                'required',
                'integer',
                'min:0',
            ],

        ];
    }
}
