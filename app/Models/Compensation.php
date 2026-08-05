<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'owner_id',
    'land_parcel_id',
    'compensation_id',
    'amount',
    'approved_date',
    'payment_date',
    'status',
])]
class Compensation extends Model
{
    public function landParcel()
    {
        return $this->belongsTo(LandParcel::class, 'land_parcel_id');
    }

    public function owner()
    {
        return $this->belongsTo(PropertyOwner::class, 'owner_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'compensation_id');
    }
}
