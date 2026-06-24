<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'parcel_id',
    'project_id',
    'lot_no',
    'district',
    'division',
    'village',
    'extent_acers',
    'extent_perches',
    'remarks',
    'status'
])]
class LandParcel extends Model
{
    //
}
