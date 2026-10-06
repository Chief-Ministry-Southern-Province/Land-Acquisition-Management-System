<?php

namespace App\Http\Controllers;

use App\Models\Backup;
use App\Services\AuditLogService;
use App\Services\BackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class BackupController extends Controller
{
    /**
     * Get the absolute path to the backups directory.
     */
    protected function getBackupDir(): string
    {
        return BackupService::getBackupDir();
    }

    /**
     * Display a listing of existing backup files.
     */
    public function index(Request $request)
    {
        $backupDir = $this->getBackupDir();
        $dbBackups = Backup::orderBy('created_at', 'desc')->get();

        $backups = [];
        foreach ($dbBackups as $backup) {
            $filePath = $backupDir.'/'.$backup->filename;
            if (File::exists($filePath)) {
                $backups[] = [
                    'filename' => $backup->filename,
                    'size' => $backup->file_size,
                    'created_at' => $backup->created_at->toDateTimeString(),
                    'type' => $backup->backup_type,
                ];
            } else {
                $backup->delete();
            }
        }

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
        try {
            $result = BackupService::createDatabaseBackup($request->user()->id, 'manual');

            return response()->json([
                'message' => 'Backup created successfully',
                'filename' => $result['filename'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Backup failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a new files backup.
     */
    public function createFiles(Request $request)
    {
        try {
            $result = BackupService::createFilesBackup($request->user()->id, 'manual');

            return response()->json([
                'message' => 'Uploaded files backup created successfully',
                'filename' => $result['filename'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Files backup failed: '.$e->getMessage(),
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

        // Delete from database
        $backup = Backup::where('filename', $filename)->first();
        if ($backup) {
            $backup->delete();
        }

        if (File::exists($filePath)) {
            File::delete($filePath);
        }

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
     * Restore database from a backup file.
     */
    public function restore(Request $request, string $filename)
    {
        $filename = basename($filename);
        $backup = Backup::where('filename', $filename)->first();
        if (! $backup) {
            return response()->json(['message' => 'Backup record not found in database'], 404);
        }

        if ($backup->backup_type !== 'database') {
            return response()->json(['message' => 'Only database backups can be restored'], 400);
        }

        $filePath = $this->getBackupDir().'/'.$filename;
        if (! File::exists($filePath)) {
            return response()->json(['message' => 'Physical backup file not found on server'], 404);
        }

        try {
            BackupService::restoreDatabaseBackup($filename, $request->user()->id);

            return response()->json([
                'message' => 'Database restored successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Restore failed: '.$e->getMessage(),
            ], 500);
        }
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
}
