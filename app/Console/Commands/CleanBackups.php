<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class CleanBackups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lams:clean-backups
                            {--days= : Override retention period in days (defaults to System Settings)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up database and file backups that exceed the configured retention period.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $daysOption = $this->option('days');
        $days = $daysOption !== null ? (int) $daysOption : null;

        $this->info('Running backup retention cleanup...');

        try {
            $result = BackupService::cleanOldBackups($days);

            if ($result['deleted_count'] > 0) {
                $this->warn("Purged {$result['deleted_count']} backup file(s) older than {$result['retention_days']} days (before {$result['cutoff_date']}):");
                foreach ($result['deleted_files'] as $filename) {
                    $this->line(" - Deleted: {$filename}");
                }
            } else {
                $this->info("No backups found older than {$result['retention_days']} days (cutoff: {$result['cutoff_date']}). Nothing to delete.");
            }

            // Also prune expired audit logs
            $deletedLogs = BackupService::cleanOldAuditLogs();
            if ($deletedLogs > 0) {
                $this->info("Purged {$deletedLogs} expired audit log entries based on audit retention policy.");
            }

            $this->info('Backup retention cleanup finished successfully.');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Backup retention cleanup failed: {$e->getMessage()}");

            return self::FAILURE;
        }
    }
}
