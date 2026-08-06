<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'land_parcel_id',
    'valuer_name',
    'valuation_date',
    'valuation_ref_number',
    'land_value',
    'crop_value',
    'structure_value',
    'total_valuation',
    'status',
    'document_id',
    'remarks',
])]
class LandValuation extends Model
{
    protected $casts = [
        'valuation_date' => 'date',
        'land_value' => 'decimal:2',
        'crop_value' => 'decimal:2',
        'structure_value' => 'decimal:2',
        'total_valuation' => 'decimal:2',
    ];

    public function landParcel()
    {
        return $this->belongsTo(LandParcel::class, 'land_parcel_id');
    }

    public function document()
    {
        return $this->belongsTo(Documents::class, 'document_id');
    }
}
