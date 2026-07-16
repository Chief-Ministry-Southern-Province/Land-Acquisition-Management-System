<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'owner_id',
    'name',
    'nic',
    'address',
    'contact',
])]
class PropertyOwner extends Model
{
    public function landParcels()
    {
        return $this->belongsToMany(LandParcel::class, 'land_parcel_property_owner', 'property_owner_id', 'land_parcel_id');
    }

    public function compensations()
    {
        return $this->hasMany(Compensation::class, 'owner_id');
    }
}
