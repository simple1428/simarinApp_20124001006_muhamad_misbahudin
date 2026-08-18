<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreShipRequest extends FormRequest
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
            'nama_kapal' => [
                'required',
                'string',
                'max:255',
                'unique:ships,nama_kapal',
            ],

            'kapasitas' => [
                'required',
                'integer',
                'min:1',
            ],

            'status' => [
                'required',
                'in:aktif,nonaktif',
            ],
        ];
    }
}
