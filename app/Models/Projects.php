<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'project_id',
    'name',
    'ministry',
    'department',
    'project_type',
    'acquisition_act',
    'district',
    'division',
    'purpose',
    'start_date',
    'estimated_completion',
    'budget_im_mn',
    'status',
    'project_manager',
    'contact',
    'email',
    'remarks'
])]
class Projects extends Model
{
    //
}
