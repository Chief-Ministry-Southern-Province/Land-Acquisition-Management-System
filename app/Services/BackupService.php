<?php

namespace App\Services;

use App\Models\AuditLogs;
use App\Models\Backup;
use App\Models\SystemSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupService
{
    /**
     * Absolute path to the backups storage directory.
     */
    public static function getBackupDir(): string
    {
        $path = storage_path('app/backups');
        if (! File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        return $path;
    }

    /**
     * Resolve a user ID for logging when user is null (CLI or automated scheduler).
     */
    protected static function resolveUserId(?int $userId): int
    {
        if ($userId) {
            return $userId;
        }

        $admin = User::whereHas('role', function ($q) {
            $q->where('role_name', 'Admin');
        })->first();

        if ($admin) {
            return $admin->id;
        }

        $firstUser = User::first();

        return $firstUser ? $firstUser->id : 1;
    }

    /**
     * Format file size in bytes to human readable format.
     */
    public static function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }

    /**
     * Check whether an automatic backup should run based on system settings and history.
     */
    public static function shouldRunAutomaticBackup(): bool
    {
        $autoBackup = SystemSetting::get('auto_backup', true);
        if ($autoBackup === false || $autoBackup === 'false' || $autoBackup === 0 || $autoBackup === '0') {
            return false;
        }

        $frequency = strtolower((string) SystemSetting::get('backup_frequency', 'daily'));
        $lastBackupAt = SystemSetting::get('last_auto_backup_at');

        if (! $lastBackupAt) {
            // Check most recent database backup in the database
            $recent = Backup::where('backup_type', 'database')->latest()->first();
            if (! $recent) {
                return true;
            }
            $lastBackupAt = $recent->created_at;
        }

        $lastTime = Carbon::parse($lastBackupAt);
        $now = Carbon::now();

        return match ($frequency) {
            'hourly' => $lastTime->diffInMinutes($now) >= 55,
            'weekly' => $lastTime->diffInDays($now) >= 7,
            'monthly' => $lastTime->diffInDays($now) >= 30,
            default => $lastTime->diffInHours($now) >= 23, // daily
        };
    }

    /**
     * Create a database backup.
     *
     * @param  int|null  $userId  User ID triggering backup (null for scheduler/CLI)
     * @param  string  $source  'manual' or 'automated'
     */
    public static function createDatabaseBackup(?int $userId = null, string $source = 'manual'): array
    {
        $dbConnection = config('database.default');
        $dbConfig = config("database.connections.{$dbConnection}");
        $backupDir = static::getBackupDir();
        $timestamp = date('Y-m-d_H-i-s');
        $sqlFilename = "backup_db_{$timestamp}.sql";
        $sqlPath = $backupDir.'/'.$sqlFilename;
        $zipFilename = "backup_db_{$timestamp}.zip";
        $zipPath = $backupDir.'/'.$zipFilename;

        try {
            if ($dbConnection === 'sqlite') {
                $dbPath = $dbConfig['database'];
                if ($dbPath === ':memory:') {
                    $sqlContent = static::dumpSqliteDatabasePHP();
                    File::put($sqlPath, $sqlContent);

                    if (class_exists('ZipArchive')) {
                        $zip = new \ZipArchive;
                        if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
                            $zip->addFile($sqlPath, $sqlFilename);
                            $zip->close();
                            File::delete($sqlPath);
                        } else {
                            $zipFilename = $sqlFilename;
                        }
                    } else {
                        $zipFilename = $sqlFilename;
                    }
                } else {
                    if (! File::exists($dbPath)) {
                        throw new \Exception('SQLite database file not found');
                    }

                    if (class_exists('ZipArchive')) {
                        $zip = new \ZipArchive;
                        if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
                            $zip->addFile($dbPath, 'database.sqlite');
                            $zip->close();
                        } else {
                            File::copy($dbPath, $backupDir."/backup_db_{$timestamp}.sqlite");
                            $zipFilename = "backup_db_{$timestamp}.sqlite";
                        }
                    } else {
                        File::copy($dbPath, $backupDir."/backup_db_{$timestamp}.sqlite");
                        $zipFilename = "backup_db_{$timestamp}.sqlite";
                    }
                }
            } else {
                // MySQL database backup
                $username = $dbConfig['username'] ?? '';
                $password = $dbConfig['password'] ?? '';
                $database = $dbConfig['database'] ?? '';
                $host = $dbConfig['host'] ?? '127.0.0.1';
                $port = $dbConfig['port'] ?? '3306';

                $mysqldumpPath = 'mysqldump';
                $command = sprintf(
                    '%s --user=%s --password=%s --host=%s --port=%s %s > %s 2>&1',
                    escapeshellcmd($mysqldumpPath),
                    escapeshellarg($username),
                    escapeshellarg($password),
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($database),
                    escapeshellarg($sqlPath)
                );

                $output = [];
                $returnVal = -1;
                exec($command, $output, $returnVal);

                // Fallback to PHP dumper if mysqldump fails
                if ($returnVal !== 0 || ! File::exists($sqlPath) || File::size($sqlPath) === 0) {
                    $sqlContent = static::dumpMysqlDatabasePHP($database);
                    File::put($sqlPath, $sqlContent);
                }

                // Compress to ZIP
                if (class_exists('ZipArchive')) {
                    $zip = new \ZipArchive;
                    if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
                        $zip->addFile($sqlPath, $sqlFilename);
                        $zip->close();
                        File::delete($sqlPath);
                    } else {
                        $zipFilename = $sqlFilename;
                    }
                } else {
                    $zipFilename = $sqlFilename;
                }
            }

            $filePath = $backupDir.'/'.$zipFilename;
            $fileSize = File::exists($filePath) ? static::formatBytes(File::size($filePath)) : '0 B';

            $backup = Backup::create([
                'filename' => $zipFilename,
                'backup_type' => 'database',
                'file_size' => $fileSize,
                'user_id' => $userId,
            ]);

            $logUserId = static::resolveUserId($userId);
            $userName = $userId ? (User::find($userId)?->name ?? 'Admin') : ($source === 'automated' ? 'Automated Scheduler' : 'CLI System');

            AuditLogService::log(
                $logUserId,
                $userName,
                'Create',
                'Backup & Maintenance',
                ($source === 'automated' ? 'Automated' : 'Manual')." database backup created: {$zipFilename}"
            );

            if ($source === 'automated') {
                SystemSetting::set('last_auto_backup_at', Carbon::now()->toDateTimeString());
            }

            return [
                'success' => true,
                'backup' => $backup,
                'filename' => $zipFilename,
                'size' => $fileSize,
            ];
        } catch (\Exception $e) {
            if (File::exists($sqlPath)) {
                File::delete($sqlPath);
            }
            if (File::exists($zipPath)) {
                File::delete($zipPath);
            }
            Log::error("Database backup failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Create an uploaded files backup.
     */
    public static function createFilesBackup(?int $userId = null, string $source = 'manual'): array
    {
        $backupDir = static::getBackupDir();
        $uploadsDir = storage_path('app/acquisition_case_documents');
        $timestamp = date('Y-m-d_H-i-s');
        $zipFilename = "backup_files_{$timestamp}.zip";
        $zipPath = $backupDir.'/'.$zipFilename;

        try {
            if (! File::exists($uploadsDir)) {
                File::makeDirectory($uploadsDir, 0755, true);
            }

            if (! class_exists('ZipArchive')) {
                throw new \Exception('PHP ZipArchive extension is not enabled');
            }

            static::zipFolder($uploadsDir, $zipPath);

            $filePath = $backupDir.'/'.$zipFilename;
            $fileSize = File::exists($filePath) ? static::formatBytes(File::size($filePath)) : '0 B';

            $backup = Backup::create([
                'filename' => $zipFilename,
                'backup_type' => 'files',
                'file_size' => $fileSize,
                'user_id' => $userId,
            ]);

            $logUserId = static::resolveUserId($userId);
            $userName = $userId ? (User::find($userId)?->name ?? 'Admin') : ($source === 'automated' ? 'Automated Scheduler' : 'CLI System');

            AuditLogService::log(
                $logUserId,
                $userName,
                'Create',
                'Backup & Maintenance',
                ($source === 'automated' ? 'Automated' : 'Manual')." uploaded files backup created: {$zipFilename}"
            );

            return [
                'success' => true,
                'backup' => $backup,
                'filename' => $zipFilename,
                'size' => $fileSize,
            ];
        } catch (\Exception $e) {
            if (File::exists($zipPath)) {
                File::delete($zipPath);
            }
            Log::error("Files backup failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Clean up backups older than the retention period.
     *
     * @param  int|null  $retentionDays  Days to keep (null loads from SystemSetting)
     */
    public static function cleanOldBackups(?int $retentionDays = null): array
    {
        if ($retentionDays === null) {
            $retentionDays = (int) SystemSetting::get('retention_days', 30);
        }

        $retentionDays = max(1, (int) $retentionDays);
        $cutoffDate = Carbon::now()->subDays($retentionDays);
        $backupDir = static::getBackupDir();
        $deletedFiles = [];

        // 1. Clean backups tracked in database
        $oldBackups = Backup::where('created_at', '<', $cutoffDate)->get();
        foreach ($oldBackups as $backup) {
            $filePath = $backupDir.'/'.$backup->filename;
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
            $deletedFiles[] = $backup->filename;
            $backup->delete();
        }

        // 2. Clean any orphaned backup files in the folder older than cutoff date
        if (File::exists($backupDir)) {
            $files = File::files($backupDir);
            foreach ($files as $file) {
                $filename = $file->getFilename();
                if (in_array($filename, $deletedFiles, true)) {
                    continue;
                }

                // Check file last modified timestamp
                $fileModifiedAt = Carbon::createFromTimestamp($file->getMTime());
                if ($fileModifiedAt->lt($cutoffDate)) {
                    File::delete($file->getPathname());
                    $deletedFiles[] = $filename;
                    // Delete from database if present
                    Backup::where('filename', $filename)->delete();
                }
            }
        }

        if (count($deletedFiles) > 0) {
            $logUserId = static::resolveUserId(null);
            AuditLogService::log(
                $logUserId,
                'Automated Retention Policy',
                'Delete',
                'Backup & Maintenance',
                'Pruned '.count($deletedFiles)." backup file(s) older than {$retentionDays} days according to retention policy."
            );
            Log::info('Backup retention: Deleted '.count($deletedFiles)." backup files older than {$retentionDays} days.");
        }

        return [
            'deleted_count' => count($deletedFiles),
            'deleted_files' => $deletedFiles,
            'retention_days' => $retentionDays,
            'cutoff_date' => $cutoffDate->toDateTimeString(),
        ];
    }

    /**
     * Clean up old audit logs based on audit log retention policy.
     */
    public static function cleanOldAuditLogs(?int $retentionDays = null): int
    {
        if ($retentionDays === null) {
            $retentionDays = (int) SystemSetting::get('audit_log_retention', 365);
        }

        if ($retentionDays <= 0) {
            return 0;
        }

        $cutoffDate = Carbon::now()->subDays($retentionDays);
        $deleted = AuditLogs::where('created_at', '<', $cutoffDate)->delete();

        if ($deleted > 0) {
            Log::info("Audit log retention: Purged {$deleted} audit log entries older than {$retentionDays} days.");
        }

        return $deleted;
    }

    /**
     * Restore database from backup file.
     */
    public static function restoreDatabaseBackup(string $filename, ?int $userId = null): void
    {
        $filename = basename($filename);
        $backupDir = static::getBackupDir();
        $filePath = $backupDir.'/'.$filename;

        $backup = Backup::where('filename', $filename)->first();
        if (! $backup) {
            throw new \Exception('Backup record not found in database');
        }

        if ($backup->backup_type !== 'database') {
            throw new \Exception('Only database backups can be restored');
        }

        if (! File::exists($filePath)) {
            throw new \Exception('Physical backup file not found on server');
        }

        $dbConnection = config('database.default');
        $dbConfig = config("database.connections.{$dbConnection}");
        $tempDir = storage_path('app/backups/temp_restore_'.uniqid());

        try {
            $sqlFile = null;
            $sqliteFile = null;

            if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) === 'zip') {
                if (! class_exists('ZipArchive')) {
                    throw new \Exception('PHP ZipArchive extension is not enabled');
                }

                $extractedFiles = static::extractZip($filePath, $tempDir);
                foreach ($extractedFiles as $file) {
                    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if ($ext === 'sql') {
                        $sqlFile = $file;
                    } elseif ($ext === 'sqlite') {
                        $sqliteFile = $file;
                    }
                }
            } else {
                $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                if ($ext === 'sql') {
                    $sqlFile = $filePath;
                } elseif ($ext === 'sqlite') {
                    $sqliteFile = $filePath;
                }
            }

            if ($dbConnection === 'sqlite') {
                $dbPath = $dbConfig['database'];
                if ($dbPath === ':memory:') {
                    if (! $sqlFile) {
                        throw new \Exception('No SQL script found in backup to restore in-memory database');
                    }
                    $sqlContent = File::get($sqlFile);
                    DB::unprepared($sqlContent);
                } else {
                    DB::disconnect();
                    if ($sqliteFile) {
                        File::copy($sqliteFile, $dbPath);
                    } elseif ($sqlFile) {
                        File::put($dbPath, '');
                        $sqlContent = File::get($sqlFile);
                        DB::unprepared($sqlContent);
                    } else {
                        throw new \Exception('No restore source file (SQL or SQLite) found in backup');
                    }
                }
            } else {
                // MySQL restore
                if (! $sqlFile) {
                    throw new \Exception('No SQL dump script found in backup');
                }
                static::runSqlRestore($sqlFile, $dbConfig);
            }

            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }

            $logUserId = static::resolveUserId($userId);
            $userName = $userId ? (User::find($userId)?->name ?? 'Admin') : 'CLI System';

            AuditLogService::log(
                $logUserId,
                $userName,
                'Restore',
                'Backup & Maintenance',
                "Restored database from backup: {$filename}"
            );
        } catch (\Exception $e) {
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }
            throw $e;
        }
    }

    /**
     * Helper to zip a folder recursively.
     */
    public static function zipFolder(string $source, string $destination): void
    {
        $zip = new \ZipArchive;
        if (! $zip->open($destination, \ZipArchive::CREATE | \ZipArchive::OVERWRITE)) {
            throw new \Exception('Failed to create zip file');
        }

        if (File::isDirectory($source)) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($source, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $file) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($source) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }

        $zip->close();
    }

    /**
     * Extract a zip archive to a target path.
     */
    public static function extractZip(string $zipPath, string $extractTo): array
    {
        $extractedFiles = [];
        $zip = new \ZipArchive;
        if ($zip->open($zipPath) === true) {
            if (! File::exists($extractTo)) {
                File::makeDirectory($extractTo, 0755, true);
            }
            $zip->extractTo($extractTo);
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $extractedFiles[] = $extractTo.'/'.$zip->getNameIndex($i);
            }
            $zip->close();
        }

        return $extractedFiles;
    }

    /**
     * Execute SQL import for database.
     */
    public static function runSqlRestore(string $sqlPath, array $dbConfig): void
    {
        $username = $dbConfig['username'] ?? '';
        $password = $dbConfig['password'] ?? '';
        $database = $dbConfig['database'] ?? '';
        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = $dbConfig['port'] ?? '3306';

        $command = sprintf(
            'mysql --user=%s --password=%s --host=%s --port=%s %s < %s 2>&1',
            escapeshellarg($username),
            escapeshellarg($password),
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($database),
            escapeshellarg($sqlPath)
        );

        $output = [];
        $returnVal = -1;
        exec($command, $output, $returnVal);

        if ($returnVal !== 0) {
            $sqlContent = File::get($sqlPath);
            DB::unprepared($sqlContent);
        }
    }

    /**
     * Pure PHP fallback to export MySQL database structure and data.
     */
    public static function dumpMysqlDatabasePHP(string $database): string
    {
        $tables = [];
        $result = DB::select('SHOW TABLES');
        $dbNameKey = 'Tables_in_'.$database;

        foreach ($result as $row) {
            $tables[] = $row->$dbNameKey ?? current((array) $row);
        }

        $sql = "-- Database Backup Fallback (PHP Dumper)\n";
        $sql .= "-- Database: `{$database}`\n";
        $sql .= '-- Generated on '.date('Y-m-d H:i:s')."\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $createTableResult = DB::select("SHOW CREATE TABLE `{$table}`");
            $createTableKey = 'Create Table';
            $createSql = $createTableResult[0]->$createTableKey ?? $createTableResult[0]->{'Create Table'} ?? current((array) $createTableResult[0]);

            $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sql .= $createSql.";\n\n";

            $rows = DB::table($table)->get();
            if ($rows->count() > 0) {
                $sql .= "-- Data dumping for table `{$table}`\n";
                foreach ($rows as $row) {
                    $rowArray = (array) $row;
                    $keys = array_keys($rowArray);
                    $values = array_values($rowArray);

                    $escapedValues = array_map(function ($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }

                        return "'".addslashes($value)."'";
                    }, $values);

                    $sql .= "INSERT INTO `{$table}` (`".implode('`, `', $keys).'`) VALUES ('.implode(', ', $escapedValues).");\n";
                }
                $sql .= "\n";
            }
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        return $sql;
    }

    /**
     * Pure PHP fallback to export SQLite database structure and data.
     */
    public static function dumpSqliteDatabasePHP(): string
    {
        $tables = [];
        $result = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        foreach ($result as $row) {
            $tables[] = $row->name;
        }

        $sql = "-- SQLite Database Backup (PHP Dumper)\n";
        $sql .= '-- Generated on '.date('Y-m-d H:i:s')."\n\n";

        foreach ($tables as $table) {
            $createTableResult = DB::select("SELECT sql FROM sqlite_master WHERE type='table' AND name = ?", [$table]);
            $createSql = $createTableResult[0]->sql ?? '';
            if ($createSql) {
                $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
                $sql .= $createSql.";\n\n";
            }

            $rows = DB::table($table)->get();
            if ($rows->count() > 0) {
                $sql .= "-- Data dumping for table `{$table}`\n";
                foreach ($rows as $row) {
                    $rowArray = (array) $row;
                    $keys = array_keys($rowArray);
                    $values = array_values($rowArray);

                    $escapedValues = array_map(function ($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }

                        return "'".addslashes($value)."'";
                    }, $values);

                    $sql .= "INSERT INTO `{$table}` (`".implode('`, `', $keys).'`) VALUES ('.implode(', ', $escapedValues).");\n";
                }
                $sql .= "\n";
            }
        }

        return $sql;
    }
}
