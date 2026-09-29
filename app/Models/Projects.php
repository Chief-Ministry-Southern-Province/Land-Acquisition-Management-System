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
    'submitted_by',
    'submitted_at',
    'hob_approved_by',
    'hob_approved_at',
    'ao_approved_by',
    'ao_approved_at',
    'as_approved_by',
    'as_approved_at',
    'sas_approved_by',
    'sas_approved_at',
    'sec_approved_by',
    'sec_approved_at',
    'case_status',
    'do_status',
    'hob_status',
    'ao_status',
    'as_status',
    'sas_status',
    'sec_status',
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
        'submitted_at' => 'datetime',
        'hob_approved_at' => 'datetime',
        'ao_approved_at' => 'datetime',
        'as_approved_at' => 'datetime',
        'sas_approved_at' => 'datetime',
        'sec_approved_at' => 'datetime',
        'land_area_to_be_acquired_acers' => 'decimal:2',
        'land_area_to_be_acquired_roods' => 'decimal:2',
        'land_area_to_be_acquired_perches' => 'decimal:2',
        'full_land_area_to_be_acquired' => 'decimal:2',
    ];

    public function landParcels()
    {
        return $this->hasMany(LandParcel::class, 'project_id');
    }

    public function progress()
    {
        return $this->hasOne(ProjectProgress::class, 'project_id');
    }

    public function documents()
    {
        return $this->hasMany(Documents::class, 'project_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function hobApprovedBy()
    {
        return $this->belongsTo(User::class, 'hob_approved_by');
    }

    public function aoApprovedBy()
    {
        return $this->belongsTo(User::class, 'ao_approved_by');
    }

    public function asApprovedBy()
    {
        return $this->belongsTo(User::class, 'as_approved_by');
    }

    public function sasApprovedBy()
    {
        return $this->belongsTo(User::class, 'sas_approved_by');
    }

    public function secApprovedBy()
    {
        return $this->belongsTo(User::class, 'sec_approved_by');
    }
}
