<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'project_id',
    'title',
    'purpose',
    'institution',
    'institution_address',
    'land_area_to_be_acquired_acers',
    'land_area_to_be_acquired_roods',
    'land_area_to_be_acquired_perches',
    'full_land_area_to_be_acquired',
    'are_residents_moved_temp',
    'section20_observation',
    'section21_secretary_report',
    'section22_secretary_recommendation',
    'section23_valuation_recommendation',
    'section24_decision_remarks',
    'section25_additional_conditions',
    'section26_final_recommendation',
    'approval_date',
    'approved_by',
    'status',
    'remarks',
])]
class Projects extends Model
{
    protected $casts = [
        'are_residents_moved_temp' => 'boolean',
        'section20_observation' => 'boolean',
        'section21_secretary_report' => 'boolean',
        'section24_decision_remarks' => 'boolean',
        'section26_final_recommendation' => 'boolean',
        'approval_date' => 'date',
        'land_area_to_be_acquired_acers' => 'decimal:2',
        'land_area_to_be_acquired_roods' => 'decimal:2',
        'land_area_to_be_acquired_perches' => 'decimal:2',
        'full_land_area_to_be_acquired' => 'decimal:2',
    ];

    public function landParcels()
    {
        return $this->hasMany(LandParcel::class, 'project_id');
    }

    public function documents()
    {
        return $this->hasMany(Documents::class, 'project_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
