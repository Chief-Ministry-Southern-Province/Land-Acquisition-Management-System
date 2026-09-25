<?php

namespace App\Services;

use App\Models\ProjectProgress;
use App\Models\Projects;
use App\Models\User;
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
}
