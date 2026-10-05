<?php

namespace App\Console\Commands;

use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use App\Services\EmailService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendChecklistReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lams:send-checklist-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify relevant Development Officers every 3 months after acquisition project creation to check and update project checklists.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking acquisition projects for 3-month checklist update reminders...');

        $projects = Projects::with('progress')->whereNotNull('created_at')->get();
        $sentCount = 0;

        foreach ($projects as $project) {
            // Do not send notifications if acquisition case is completed or rejected
            if (in_array(strtolower((string) $project->case_status), ['completed', 'rejected'])) {
                $this->line("Skipped project '{$project->title}' (ID: {$project->id}): Case status is '{$project->case_status}'.");

                continue;
            }

            // Do not send notifications if acquisition project checklist is fully over (100% completed)
            $progress = $project->progress;
            if ($progress) {
                $isFullyCompleted = $progress->progress_percentage >= 100 ||
                    ($progress->total_items > 0 && $progress->completed_items >= $progress->total_items);

                if ($isFullyCompleted) {
                    $this->line("Skipped project '{$project->title}' (ID: {$project->id}): Acquisition checklist is 100% completed.");

                    continue;
                }
            }

            $createdDate = Carbon::parse($project->created_at);
            $monthsElapsed = (int) floor($createdDate->diffInMonths(now()));

            // Only notify for every 3-month interval (e.g. 3, 6, 9, 12, 15, 18, 24...)
            if ($monthsElapsed <= 0 || $monthsElapsed % 3 !== 0) {
                continue;
            }

            // Target DO (Development Officer) user for this project
            $doUsers = collect();

            if ($project->submitted_by) {
                $submittedUser = User::find($project->submitted_by);
                if ($submittedUser && $submittedUser->role && $submittedUser->role->role_name === 'DO') {
                    $doUsers->push($submittedUser);
                }
            }

            // Fallback: If no submitted_by user found with DO role, find DO users for this project's institution
            if ($doUsers->isEmpty()) {
                $doUsers = $project->getInstitutionOfficers('DO');
            }

            if ($doUsers->isEmpty()) {
                Log::warning("No Development Officer (DO) found for project ID {$project->id}. Skipping checklist reminder.");

                continue;
            }

            foreach ($doUsers as $doUser) {
                // Check if a reminder for this project and this 3-month milestone (or within last 80 days) was already sent to avoid duplication
                $recentlyNotified = DB::table('notifications')
                    ->where('notifiable_id', $doUser->id)
                    ->where('notifiable_type', User::class)
                    ->where(function ($query) use ($project) {
                        $query->whereRaw("JSON_EXTRACT(data, '$.project_id') = ?", [(string) $project->project_id])
                            ->orWhereRaw("JSON_EXTRACT(data, '$.project_id') = ?", [(string) $project->id])
                            ->orWhereRaw('data LIKE ?', ['%"'.$project->title.'"%']);
                    })
                    ->where('created_at', '>=', now()->subDays(80))
                    ->exists();

                if ($recentlyNotified) {
                    $this->line("Skipped project '{$project->title}' (ID: {$project->id}) for DO {$doUser->name}: Already notified within last 80 days.");

                    continue;
                }

                $title = "Quarterly Checklist Update Reminder ({$monthsElapsed} Months)";
                $message = "Project '{$project->title}' (ID: {$project->project_id}) was created {$monthsElapsed} months ago. Please review and update the progress checklist.";
                $actionUrl = "/development-officer/mark-progress?projectId={$project->project_id}";

                // 1. Send In-App Notification (Database & Broadcast)
                $doUser->notify(new RealtimeSystemNotification(
                    title: $title,
                    message: $message,
                    actionUrl: $actionUrl,
                    type: 'warning',
                    projectId: (string) $project->project_id,
                    notificationCategory: 'checklist_reminder'
                ));

                // 2. Send via user's preferred notification channel (Email/SMS)
                EmailService::sendChecklistReminderEmail($doUser, $project, $monthsElapsed);

                $sentCount++;
                $this->info("Notified DO {$doUser->name} for project '{$project->title}' ({$monthsElapsed} months milestone).");
            }
        }

        $this->info("Finished sending checklist reminders. Total notifications dispatched: {$sentCount}");

        return Command::SUCCESS;
    }
}
