<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectChecklistReminder extends Model
{
    protected $table = 'project_checklist_reminders';

    protected $fillable = [
        'project_id',
        'milestone_months',
        'do_user_id',
        'first_reminder_sent_at',
        'second_reminder_sent_at',
        'escalated_to_sas_at',
        'sas_user_id',
        'progress_updated_at',
        'status',
    ];

    protected $casts = [
        'milestone_months' => 'integer',
        'first_reminder_sent_at' => 'datetime',
        'second_reminder_sent_at' => 'datetime',
        'escalated_to_sas_at' => 'datetime',
        'progress_updated_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class, 'project_id');
    }

    public function doUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'do_user_id');
    }

    public function sasUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sas_user_id');
    }
}
