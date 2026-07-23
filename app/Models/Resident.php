<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'land_parcel_id',
        'name',
        'address',
        'nic',
        'contact',
        'relationship',
    ];

    public function landParcel()
    {
        return $this->belongsTo(LandParcel::class);
    }
}
