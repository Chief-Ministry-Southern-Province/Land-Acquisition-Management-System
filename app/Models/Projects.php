<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_id',
    'department_id',
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
        'department_id' => 'integer',
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

    public function department(): BelongsTo
    {
        return $this->belongsTo(Departments::class, 'department_id');
    }

    /**
     * Resolve the associated institution/department for this project.
     */
    public function getInstitutionDepartment(): ?Departments
    {
        // 1. Direct relationship
        if ($this->department_id) {
            $dept = Departments::find($this->department_id);
            if ($dept) {
                return $dept;
            }
        }

        // 2. Resolve via institution field (exact, case-insensitive, or substring/code match)
        if (! empty($this->institution) && $this->institution !== 'N/A') {
            $trimmed = trim($this->institution);

            // Check if numeric ID was stored
            if (is_numeric($trimmed)) {
                $dept = Departments::find((int) $trimmed);
                if ($dept) {
                    return $dept;
                }
            }

            // Exact match
            $dept = Departments::where('department_name', $trimmed)
                ->orWhere('dep_code', $trimmed)
                ->first();
            if ($dept) {
                return $dept;
            }

            // Case-insensitive match
            $dept = Departments::whereRaw('LOWER(department_name) = ?', [strtolower($trimmed)])
                ->orWhereRaw('LOWER(dep_code) = ?', [strtolower($trimmed)])
                ->first();
            if ($dept) {
                return $dept;
            }

            // Substring or code match (e.g. "Ministry of Highways - RDA" matching dep_code "RDA" or "Road Development Authority")
            $allDepartments = Departments::all();
            foreach ($allDepartments as $d) {
                if (! empty($d->dep_code) && stripos($trimmed, $d->dep_code) !== false) {
                    return $d;
                }
                if (! empty($d->department_name) && (stripos($trimmed, $d->department_name) !== false || stripos($d->department_name, $trimmed) !== false)) {
                    return $d;
                }
            }
        }

        // 3. Fallback to submitting officer's department
        if ($this->submitted_by) {
            $submitter = $this->submittedBy ?? User::find($this->submitted_by);
            if ($submitter && $submitter->department_id) {
                return Departments::find($submitter->department_id);
            }
        }

        return null;
    }

    /**
     * Get officers for specific role(s) belonging to this project's institution.
     *
     * @return Collection<int, User>
     */
    public function getInstitutionOfficers(string|array $roles)
    {
        $roleArray = is_array($roles) ? $roles : [$roles];
        $department = $this->getInstitutionDepartment();

        $baseQuery = User::whereHas('role', fn ($q) => $q->whereIn('role_name', $roleArray));

        if ($department) {
            $departmentOfficers = (clone $baseQuery)->where('department_id', $department->id)->get();

            // If there are officers with the target role(s) in this institution, notify only them
            if ($departmentOfficers->isNotEmpty()) {
                return $departmentOfficers;
            }
        }

        // Fallback to all users registered to the role if no institution-specific officer found
        return $baseQuery->get();
    }
}
