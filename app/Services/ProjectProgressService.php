<?php

namespace App\Services;

use App\Models\ProjectChecklistReminder;
use App\Models\ProjectProgress;
use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use Carbon\Carbon;
use Exception;

class ProjectProgressService
{
    /**
     * Get acquisition case progress by project instance or ID.
     */
    public function getProgress(Projects|int|string $project): ?ProjectProgress
    {
        $projectId = $project instanceof Projects ? $project->id : $project;

        return ProjectProgress::with('updatedBy')->where('project_id', $projectId)->first();
    }

    /**
     * Get active or latest checklist reminder status for a project.
     */
    public function getActiveReminderInfo(Projects|int|string $project): ?array
    {
        $projectId = $project instanceof Projects ? $project->id : $project;

        $reminder = ProjectChecklistReminder::where('project_id', $projectId)
            ->latest()
            ->first();

        if (! $reminder) {
            return null;
        }

        $now = Carbon::now();
        $deadline = null;
        $daysRemaining = null;
        $isOverdue = false;

        if ($reminder->status === 'pending_do' && $reminder->first_reminder_sent_at) {
            $deadline = Carbon::parse($reminder->first_reminder_sent_at)->addDays(7);
            $daysRemaining = max(0, $now->diffInDays($deadline, false));
            $isOverdue = $now->gt($deadline);
        } elseif ($reminder->status === 'second_reminder_sent' && $reminder->second_reminder_sent_at) {
            $deadline = Carbon::parse($reminder->second_reminder_sent_at)->addDays(7);
            $daysRemaining = max(0, $now->diffInDays($deadline, false));
            $isOverdue = $now->gt($deadline);
        }

        return [
            'id' => $reminder->id,
            'project_id' => $reminder->project_id,
            'milestone_months' => $reminder->milestone_months,
            'status' => $reminder->status, // pending_do | second_reminder_sent | escalated_to_sas | resolved
            'first_reminder_sent_at' => $reminder->first_reminder_sent_at?->toIso8601String(),
            'second_reminder_sent_at' => $reminder->second_reminder_sent_at?->toIso8601String(),
            'escalated_to_sas_at' => $reminder->escalated_to_sas_at?->toIso8601String(),
            'progress_updated_at' => $reminder->progress_updated_at?->toIso8601String(),
            'deadline_date' => $deadline?->toIso8601String(),
            'days_remaining' => $daysRemaining,
            'is_overdue' => $isOverdue,
        ];
    }

    /**
     * Mark/Update acquisition case progress. Only Development Officer (DO) can perform this.
     */
    public function saveProgress(Projects $project, array $stages, User $user): ProjectProgress
    {
        if (! $user->role || $user->role->role_name !== 'DO') {
            throw new Exception('Forbidden. Only Development Officers (DO) can mark acquisition progress.', 403);
        }

        $totalItems = 0;
        $completedItems = 0;

        foreach ($stages as $stage) {
            if (isset($stage['items']) && is_array($stage['items'])) {
                foreach ($stage['items'] as $item) {
                    $totalItems++;
                    if (! empty($item['isCompleted'])) {
                        $completedItems++;
                    }
                }
            }
        }

        $progressPercentage = $totalItems > 0 ? (int) round(($completedItems / $totalItems) * 100) : 0;
        $now = Carbon::now();

        $progress = ProjectProgress::updateOrCreate(
            ['project_id' => $project->id],
            [
                'stages' => $stages,
                'total_items' => $totalItems,
                'completed_items' => $completedItems,
                'progress_percentage' => $progressPercentage,
                'updated_by' => $user->id,
                'last_saved_at' => $now,
            ]
        );

        // Resolve any active checklist reminder upon progress update
        $this->resolvePendingReminder($project, $user, $now);

        // Audit Log entry
        AuditLogService::log(
            $user->id,
            $user->name,
            'Updated Project Progress',
            'Progress Tracking',
            "Updated acquisition progress checklist for project ID {$project->project_id} ({$project->title}). Completed {$completedItems}/{$totalItems} items ({$progressPercentage}%)."
        );

        return $progress->load('updatedBy');
    }

    /**
     * Automatically resolve any pending or escalated checklist reminder for a project.
     */
    public function resolvePendingReminder(Projects $project, ?User $user = null, ?Carbon $timestamp = null): ?ProjectChecklistReminder
    {
        $timestamp = $timestamp ?? Carbon::now();

        $activeReminder = ProjectChecklistReminder::where('project_id', $project->id)
            ->whereIn('status', ['pending_do', 'second_reminder_sent', 'escalated_to_sas'])
            ->latest()
            ->first();

        if ($activeReminder) {
            $wasEscalated = $activeReminder->status === 'escalated_to_sas';

            $activeReminder->update([
                'progress_updated_at' => $timestamp,
                'status' => 'resolved',
            ]);

            // If the reminder was previously escalated to SAS, notify SAS that the DO resolved it
            if ($wasEscalated) {
                $sasUsers = $project->getInstitutionOfficers('SAS');
                $doName = $user ? $user->name : 'Development Officer';

                foreach ($sasUsers as $sasUser) {
                    $sasUser->notify(new RealtimeSystemNotification(
                        title: "Progress Updated: {$project->title}",
                        message: "DO {$doName} has now updated acquisition progress for previously escalated project '{$project->title}'.",
                        actionUrl: "/mark-progress?projectId={$project->project_id}",
                        type: 'success',
                        projectId: (string) $project->project_id,
                        notificationCategory: 'checklist_resolved'
                    ));
                }
            }

            return $activeReminder;
        }

        return null;
    }
}
