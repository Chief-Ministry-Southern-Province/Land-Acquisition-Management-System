<?php

namespace App\Console\Commands;

use App\Models\Documents;
use App\Models\ProjectChecklistReminder;
use App\Models\Projects;
use App\Models\User;
use App\Notifications\RealtimeSystemNotification;
use App\Services\EmailService;
use Carbon\Carbon;
use Illuminate\Console\Command;
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
    protected $description = 'Notify DOs every 3 months to update progress in Mark Progress, follow up after 1 week if ignored, and escalate to SAS after another week.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking acquisition projects for 3-month progress reminders, follow-ups, and escalations...');

        $projects = Projects::with('progress')->whereNotNull('created_at')->get();
        $firstReminderCount = 0;
        $secondReminderCount = 0;
        $escalationCount = 0;

        foreach ($projects as $project) {
            // Do not process completed or rejected acquisition projects
            if (in_array(strtolower((string) $project->case_status), ['completed', 'rejected'])) {
                $this->line("Skipped project '{$project->title}' (ID: {$project->id}): Case status is '{$project->case_status}'.");

                continue;
            }

            // Do not process projects where checklist is 100% completed
            $progress = $project->progress;
            if ($progress) {
                $isFullyCompleted = $progress->progress_percentage >= 100 ||
                    ($progress->total_items > 0 && $progress->completed_items >= $progress->total_items);

                if ($isFullyCompleted) {
                    $this->line("Skipped project '{$project->title}' (ID: {$project->id}): Checklist is 100% completed.");

                    continue;
                }
            }

            $createdDate = Carbon::parse($project->created_at);
            $monthsElapsed = (int) floor($createdDate->diffInMonths(now()));

            if ($monthsElapsed < 3) {
                continue;
            }

            // Calculate current 3-month milestone (3, 6, 9, 12, 15, ...)
            $milestone = ((int) floor($monthsElapsed / 3)) * 3;

            // Target DO (Development Officer) users for this project
            $doUsers = collect();

            if ($project->submitted_by) {
                $submittedUser = User::find($project->submitted_by);
                if ($submittedUser && $submittedUser->role && $submittedUser->role->role_name === 'DO') {
                    $doUsers->push($submittedUser);
                }
            }

            if ($doUsers->isEmpty()) {
                $doUsers = $project->getInstitutionOfficers('DO');
            }

            if ($doUsers->isEmpty()) {
                Log::warning("No Development Officer (DO) found for project ID {$project->id}. Skipping reminder check.");

                continue;
            }

            $primaryDo = $doUsers->first();

            // Check if reminder record exists for this milestone
            $reminder = ProjectChecklistReminder::where('project_id', $project->id)
                ->where('milestone_months', $milestone)
                ->first();

            // ─────────────────────────────────────────────────────────────
            // SCENARIO 1: First Reminder at 3-Month Milestone
            // ─────────────────────────────────────────────────────────────
            if (! $reminder) {
                // If DO already updated progress on or after the milestone date, mark as resolved automatically
                $milestoneDate = $createdDate->copy()->addMonths($milestone);
                $hasUpdatedAfterMilestone = $progress && $progress->last_saved_at && Carbon::parse($progress->last_saved_at)->gte($milestoneDate);

                if ($hasUpdatedAfterMilestone) {
                    ProjectChecklistReminder::create([
                        'project_id' => $project->id,
                        'milestone_months' => $milestone,
                        'do_user_id' => $primaryDo->id,
                        'first_reminder_sent_at' => now(),
                        'progress_updated_at' => $progress->last_saved_at,
                        'status' => 'resolved',
                    ]);
                    $this->line("Project '{$project->title}': Already updated by DO for {$milestone}M milestone.");

                    continue;
                }

                // Send Initial (1st) Reminder to DO
                $title = "Quarterly Progress Update Reminder ({$milestone} Months)";
                $message = "Project '{$project->title}' (ID: {$project->project_id}) was created {$milestone} months ago. Please update acquisition progress in Mark Progress (complete a stage, add remarks, or upload supporting documents) within 7 days.";
                $actionUrl = "/mark-progress?projectId={$project->project_id}";

                foreach ($doUsers as $doUser) {
                    $doUser->notify(new RealtimeSystemNotification(
                        title: $title,
                        message: $message,
                        actionUrl: $actionUrl,
                        type: 'warning',
                        projectId: (string) $project->project_id,
                        notificationCategory: 'checklist_reminder'
                    ));

                    EmailService::sendChecklistReminderEmail($doUser, $project, $milestone);
                }

                ProjectChecklistReminder::create([
                    'project_id' => $project->id,
                    'milestone_months' => $milestone,
                    'do_user_id' => $primaryDo->id,
                    'first_reminder_sent_at' => now(),
                    'status' => 'pending_do',
                ]);

                $firstReminderCount++;
                $this->info("Dispatched 1st reminder to DO for project '{$project->title}' ({$milestone}M milestone).");

                continue;
            }

            // If reminder for this milestone is already marked resolved, nothing more to do
            if ($reminder->status === 'resolved') {
                continue;
            }

            // ─────────────────────────────────────────────────────────────
            // CHECK IF DO UPDATED PROGRESS IN MarkProgress.tsx
            // Either by completing a stage/item, adding remarks, or uploading documents
            // ─────────────────────────────────────────────────────────────
            $hasSavedProgress = $progress && $progress->last_saved_at && Carbon::parse($progress->last_saved_at)->gt($reminder->first_reminder_sent_at);
            $hasUploadedDocument = Documents::where('project_id', $project->id)
                ->where('created_at', '>', $reminder->first_reminder_sent_at)
                ->exists();

            if ($hasSavedProgress || $hasUploadedDocument) {
                $updatedAt = $hasSavedProgress ? $progress->last_saved_at : now();
                $reminder->update([
                    'progress_updated_at' => $updatedAt,
                    'status' => 'resolved',
                ]);
                $this->info("Project '{$project->title}': DO updated progress. Milestone {$milestone} reminder resolved.");

                continue;
            }

            // ─────────────────────────────────────────────────────────────
            // SCENARIO 2: Follow-up 2nd Reminder to DO after 1 week (7 days)
            // ─────────────────────────────────────────────────────────────
            if (is_null($reminder->second_reminder_sent_at)) {
                $daysSinceFirst = Carbon::parse($reminder->first_reminder_sent_at)->diffInDays(now());

                if ($daysSinceFirst >= 7) {
                    $title = "[Urgent - 2nd Notice] Acquisition Progress Update Overdue ({$milestone} Months)";
                    $message = "You have not updated progress for project '{$project->title}' (ID: {$project->project_id}) within 1 week of reminder. Please update progress (complete a stage, add remarks, or upload documents) in Mark Progress within 7 days to avoid escalation to Senior Assistant Secretary (SAS).";
                    $actionUrl = "/mark-progress?projectId={$project->project_id}";

                    foreach ($doUsers as $doUser) {
                        $doUser->notify(new RealtimeSystemNotification(
                            title: $title,
                            message: $message,
                            actionUrl: $actionUrl,
                            type: 'error',
                            projectId: (string) $project->project_id,
                            notificationCategory: 'checklist_second_reminder'
                        ));

                        EmailService::sendChecklistSecondReminderEmail($doUser, $project, $milestone);
                    }

                    $reminder->update([
                        'second_reminder_sent_at' => now(),
                        'status' => 'second_reminder_sent',
                    ]);

                    $secondReminderCount++;
                    $this->warn("Sent 2nd reminder to DO for project '{$project->title}'.");
                }

                continue;
            }

            // ─────────────────────────────────────────────────────────────
            // SCENARIO 3: Escalation to SAS after another 1 week (7 days)
            // ─────────────────────────────────────────────────────────────
            if (is_null($reminder->escalated_to_sas_at)) {
                $daysSinceSecond = Carbon::parse($reminder->second_reminder_sent_at)->diffInDays(now());

                if ($daysSinceSecond >= 7) {
                    $sasUsers = $project->getInstitutionOfficers('SAS');

                    if ($sasUsers->isEmpty()) {
                        Log::warning("No Senior Assistant Secretary (SAS) found for project ID {$project->id}. Cannot dispatch escalation.");

                        continue;
                    }

                    $title = "[Escalation Notice] Progress Update Ignored by DO: {$project->title}";
                    $message = "Attention SAS: Development Officer has failed to update the acquisition checklist for project '{$project->title}' (ID: {$project->project_id}) after 2 reminders over 2 weeks. Please review and intervene.";
                    $actionUrl = "/mark-progress?projectId={$project->project_id}";

                    foreach ($sasUsers as $sasUser) {
                        // In-app Realtime Notification
                        $sasUser->notify(new RealtimeSystemNotification(
                            title: $title,
                            message: $message,
                            actionUrl: $actionUrl,
                            type: 'error',
                            projectId: (string) $project->project_id,
                            notificationCategory: 'checklist_escalation'
                        ));

                        // Preferred notification medium (Email and/or SMS per notification_preference)
                        EmailService::sendChecklistEscalationToSasEmail($sasUser, $project, $milestone, $primaryDo);
                    }

                    $reminder->update([
                        'escalated_to_sas_at' => now(),
                        'sas_user_id' => $sasUsers->first()?->id,
                        'status' => 'escalated_to_sas',
                    ]);

                    $escalationCount++;
                    $this->error("Escalated project '{$project->title}' to SAS ({$sasUsers->count()} officers notified via preferred medium).");
                }
            }
        }

        $this->info("Completed checklist reminder cycle. 1st reminders: {$firstReminderCount}, 2nd reminders: {$secondReminderCount}, Escalations to SAS: {$escalationCount}.");

        return Command::SUCCESS;
    }
}
