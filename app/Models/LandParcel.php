<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'parcel_id',
    'project_id',
    'document_id',
    'land_name',
    'province',
    'district',
    'divisional_secretariat',
    'grama_niladari_division',
    'village',
    'land_size_acers',
    'land_size_roods',
    'land_size_perches',
    'full_land_size',
    'latitude',
    'longitude',
    'boundary_geojson',
    'has_plan',
    'plan_number',
    'parcel_numbers',
    'boundaries_north',
    'boundaries_south',
    'boundaries_east',
    'boundaries_west',
    'has_residential_houses',
    'is_resident_owner',
    'is_cultivated',
    'cultivation',
    'cultivation_status',
    'annual_income',
    'land_type',
    'estimated_value',
    'remarks',
    'status',
])]
class LandParcel extends Model
{
    protected $casts = [
        'has_plan' => 'boolean',
        'has_residential_houses' => 'boolean',
        'is_resident_owner' => 'boolean',
        'is_cultivated' => 'boolean',
        'parcel_numbers' => 'array',
        'boundary_geojson' => 'array',
        'land_size_acers' => 'decimal:2',
        'land_size_roods' => 'decimal:2',
        'land_size_perches' => 'decimal:2',
        'full_land_size' => 'decimal:2',
        'annual_income' => 'decimal:2',
        'estimated_value' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function owners()
    {
        return $this->belongsToMany(PropertyOwner::class, 'land_parcel_property_owner', 'land_parcel_id', 'property_owner_id');
    }

    public function project()
    {
        return $this->belongsTo(Projects::class, 'project_id');
    }

    public function document()
    {
        return $this->belongsTo(Documents::class, 'document_id');
    }

    public function residents()
    {
        return $this->hasMany(Resident::class);
    }
}
