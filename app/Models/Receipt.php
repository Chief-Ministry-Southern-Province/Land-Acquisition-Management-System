<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'land_parcel_id',
    'receipt_number',
    'receipt_date',
    'received_from',
    'amount_rupees',
    'amount_cents',
    'reason',
    'document_id',
])]
class Receipt extends Model
{
    protected $casts = [
        'receipt_date' => 'date',
        'amount_rupees' => 'decimal:2',
        'amount_cents' => 'integer',
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
