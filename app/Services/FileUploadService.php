<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class FileUploadService
{
    public function upload(
        UploadedFile $file,
        string $disk,
        string $folder,
        array $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'docx'],
        int $maxSizeKb = 51200
    ): array {
        $this->validateFile($file, $allowedExtensions, $maxSizeKb);

        // Securely guess the extension based on MIME type rather than client input
        $extension = strtolower($file->guessExtension() ?? $file->getClientOriginalExtension());
        $storedFileName = Str::uuid().'.'.$extension;
        $folder = trim($folder, '/');

        $path = Storage::disk($disk)->putFileAs($folder, $file, $storedFileName);

        if ($path === false) {
            throw new RuntimeException("Failed to store file on disk [{$disk}] in folder [{$folder}].");
        }

        return [
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename' => $storedFileName,
            'file_path' => "{$folder}/{$storedFileName}",
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'disk' => $disk,
        ];
    }

    public function delete(string $disk, string $filePath): bool
    {
        return Storage::disk($disk)->delete($filePath);
    }

    public function temporaryUrl(string $disk, string $filePath, int $expiresInMinutes = 5): string
    {
        try {
            return Storage::disk($disk)->temporaryUrl(
                $filePath,
                now()->addMinutes($expiresInMinutes)
            );
        } catch (RuntimeException $e) {
            // Fallback to normal public URL for drivers that don't support temporary URLs (e.g. local)
            return Storage::disk($disk)->url($filePath);
        }
    }

    protected function validateFile(UploadedFile $file, array $allowedExtensions, int $maxSizeKb): void
    {
        if (! $file->isValid()) {
            throw new RuntimeException('Uploaded file is invalid or failed to transfer.');
        }

        // Securely resolve extension
        $extension = strtolower($file->guessExtension() ?? $file->getClientOriginalExtension());
        if (! in_array($extension, $allowedExtensions, true)) {
            throw new RuntimeException("File type .{$extension} is not permitted.");
        }

        $sizeKb = $file->getSize() / 1024;
        if ($sizeKb > $maxSizeKb) {
            throw new RuntimeException("File exceeds the maximum allowed size of {$maxSizeKb}KB.");
        }
    }
}
