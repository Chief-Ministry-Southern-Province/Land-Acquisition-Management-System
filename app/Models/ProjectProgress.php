<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectProgress extends Model
{
    protected $table = 'project_progresses';

    protected $fillable = [
        'project_id',
        'stages',
        'total_items',
        'completed_items',
        'progress_percentage',
        'updated_by',
        'last_saved_at',
    ];

    protected $casts = [
        'stages' => 'array',
        'total_items' => 'integer',
        'completed_items' => 'integer',
        'progress_percentage' => 'integer',
        'last_saved_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Projects::class, 'project_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
