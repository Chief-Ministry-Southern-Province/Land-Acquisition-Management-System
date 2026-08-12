<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BackupController extends Controller
{
    /**
     * Get the absolute path to the backups directory.
     */
    protected function getBackupDir(): string
    {
        $path = storage_path('app/backups');
        if (! File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        return $path;
    }

    /**
     * Display a listing of existing backup files.
     */
    public function index(Request $request)
    {
        $backupDir = $this->getBackupDir();
        $files = File::files($backupDir);

        $backups = [];
        foreach ($files as $file) {
            // Only list zip or sql or sqlite files
            $ext = strtolower($file->getExtension());
            if (in_array($ext, ['zip', 'sql', 'sqlite'])) {
                $backups[] = [
                    'filename' => $file->getFilename(),
                    'size' => $this->formatBytes($file->getSize()),
                    'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            }
        }

        // Sort by creation time desc
        usort($backups, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return response()->json([
            'message' => 'Backups listed successfully',
            'backups' => $backups,
        ]);
    }

    /**
     * Generate a new database backup.
     */
    public function create(Request $request)
    {
        $dbConnection = config('database.default');
        $dbConfig = config("database.connections.{$dbConnection}");
        $backupDir = $this->getBackupDir();
        $timestamp = date('Y-m-d_H-i-s');
        $sqlFilename = "backup_{$timestamp}.sql";
        $sqlPath = $backupDir.'/'.$sqlFilename;
        $zipFilename = "backup_{$timestamp}.zip";
        $zipPath = $backupDir.'/'.$zipFilename;

        try {
            if ($dbConnection === 'sqlite') {
                $dbPath = $dbConfig['database'];
                if ($dbPath === ':memory:') {
                    $sqlContent = $this->dumpSqliteDatabasePHP();
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
                        return response()->json(['message' => 'SQLite database file not found'], 500);
                    }

                    // For SQLite, zip the database file directly
                    if (class_exists('ZipArchive')) {
                        $zip = new \ZipArchive;
                        if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
                            $zip->addFile($dbPath, 'database.sqlite');
                            $zip->close();
                        } else {
                            // Fallback to copy if zip fails
                            File::copy($dbPath, $backupDir."/backup_{$timestamp}.sqlite");
                            $zipFilename = "backup_{$timestamp}.sqlite";
                        }
                    } else {
                        File::copy($dbPath, $backupDir."/backup_{$timestamp}.sqlite");
                        $zipFilename = "backup_{$timestamp}.sqlite";
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
                // Try running mysqldump via command line
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

                // If mysqldump fails, use pure PHP fallback dump
                if ($returnVal !== 0 || ! File::exists($sqlPath) || File::size($sqlPath) === 0) {
                    $sqlContent = $this->dumpMysqlDatabasePHP($database);
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
                        // Fallback to keeping .sql if zip fails
                        $zipFilename = $sqlFilename;
                    }
                } else {
                    $zipFilename = $sqlFilename;
                }
            }

            // Log action in audit logs
            AuditLogService::log(
                $request->user()->id,
                $request->user()->name,
                'Create',
                'Backup & Maintenance',
                "Created database backup: {$zipFilename}"
            );

            return response()->json([
                'message' => 'Backup created successfully',
                'filename' => $zipFilename,
            ], 201);

        } catch (\Exception $e) {
            // Clean up temporary files
            if (File::exists($sqlPath)) {
                File::delete($sqlPath);
            }

            return response()->json([
                'message' => 'Backup failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a specific backup file.
     */
    public function download(Request $request, string $filename)
    {
        // Path traversal protection
        $filename = basename($filename);
        $filePath = $this->getBackupDir().'/'.$filename;

        if (! File::exists($filePath)) {
            return response()->json(['message' => 'Backup file not found'], 404);
        }

        // Log download in audit logs
        AuditLogService::log(
            $request->user()->id,
            $request->user()->name,
            'Download',
            'Backup & Maintenance',
            "Downloaded database backup: {$filename}"
        );

        return response()->download($filePath);
    }

    /**
     * Delete a specific backup file.
     */
    public function destroy(Request $request, string $filename)
    {
        // Path traversal protection
        $filename = basename($filename);
        $filePath = $this->getBackupDir().'/'.$filename;

        if (! File::exists($filePath)) {
            return response()->json(['message' => 'Backup file not found'], 404);
        }

        File::delete($filePath);

        // Log deletion in audit logs
        AuditLogService::log(
            $request->user()->id,
            $request->user()->name,
            'Delete',
            'Backup & Maintenance',
            "Deleted database backup: {$filename}"
        );

        return response()->json([
            'message' => 'Backup file deleted successfully',
        ]);
    }

    /**
     * Clear application cache.
     */
    public function clearCache(Request $request)
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');

            AuditLogService::log(
                $request->user()->id,
                $request->user()->name,
                'Clear Cache',
                'Backup & Maintenance',
                'Cleared application cache, config, view, and routes'
            );

            return response()->json([
                'message' => 'System cache cleared successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to clear cache: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format file size in bytes to human readable format.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }

    /**
     * Pure PHP fallback to export MySQL database structure and data.
     */
    protected function dumpMysqlDatabasePHP(string $database): string
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
            // Get CREATE TABLE
            $createTableResult = DB::select("SHOW CREATE TABLE `{$table}`");
            $createTableKey = 'Create Table';
            $createSql = $createTableResult[0]->$createTableKey ?? $createTableResult[0]->{'Create Table'} ?? current((array) $createTableResult[0]);

            $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sql .= $createSql.";\n\n";

            // Get Rows
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
    protected function dumpSqliteDatabasePHP(): string
    {
        $tables = [];
        $result = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        foreach ($result as $row) {
            $tables[] = $row->name;
        }

        $sql = "-- SQLite Database Backup (PHP Dumper)\n";
        $sql .= '-- Generated on '.date('Y-m-d H:i:s')."\n\n";

        foreach ($tables as $table) {
            // Get CREATE TABLE
            $createTableResult = DB::select("SELECT sql FROM sqlite_master WHERE type='table' AND name = ?", [$table]);
            $createSql = $createTableResult[0]->sql ?? '';
            if ($createSql) {
                $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
                $sql .= $createSql.";\n\n";
            }

            // Get Rows
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
