<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use App\Services\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RunAutomaticBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lams:run-backup
                            {--force : Force backup execution even if disabled or not due according to frequency schedule}
                            {--type=database : Backup type: database, files, or all}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute scheduled automatic backups and prune backups exceeding retention period.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isForced = (bool) $this->option('force');
        $type = strtolower((string) $this->option('type'));
        $autoBackupEnabled = SystemSetting::get('auto_backup', true);
        $frequency = SystemSetting::get('backup_frequency', 'daily');

        $this->info('Checking automatic backup settings...');
        $this->line('Auto-backup enabled: '.($autoBackupEnabled ? 'YES' : 'NO'));
        $this->line("Configured frequency: {$frequency}");

        if (! $autoBackupEnabled && ! $isForced) {
            $this->comment('Automatic backups are disabled in System Settings. Skipping backup (use --force to override).');

            return self::SUCCESS;
        }

        if (! $isForced && ! BackupService::shouldRunAutomaticBackup()) {
            $this->comment("Automatic backup is not due yet based on the '{$frequency}' schedule. Skipping.");

            return self::SUCCESS;
        }

        $this->info('Starting scheduled automatic backup...');

        try {
            // Database backup
            if (in_array($type, ['database', 'all'])) {
                $this->line('Generating database backup...');
                $dbResult = BackupService::createDatabaseBackup(null, 'automated');
                $this->info("✓ Database backup created successfully: {$dbResult['filename']} ({$dbResult['size']})");
            }

            // Uploaded files backup
            if (in_array($type, ['files', 'all'])) {
                $this->line('Generating uploaded files backup...');
                $filesResult = BackupService::createFilesBackup(null, 'automated');
                $this->info("✓ Uploaded files backup created successfully: {$filesResult['filename']} ({$filesResult['size']})");
            }

            // Run retention policy cleanup immediately after backup
            $this->line('Checking backup retention policy...');
            $retentionResult = BackupService::cleanOldBackups();
            if ($retentionResult['deleted_count'] > 0) {
                $this->warn("✓ Pruned {$retentionResult['deleted_count']} backup(s) older than {$retentionResult['retention_days']} days.");
                foreach ($retentionResult['deleted_files'] as $df) {
                    $this->line("  - Removed: {$df}");
                }
            } else {
                $this->line("✓ Backup retention check passed (retention period: {$retentionResult['retention_days']} days). No expired backups to prune.");
            }

            $this->info('Scheduled backup routine completed successfully.');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Automated backup failed: {$e->getMessage()}");
            Log::error("Scheduled automatic backup error: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);

            return self::FAILURE;
        }
    }
}
