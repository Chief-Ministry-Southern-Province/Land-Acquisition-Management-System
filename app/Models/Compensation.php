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
    'status'
])]
class Compensation extends Model
{
    //
}
