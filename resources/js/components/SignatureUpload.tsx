import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface SignatureUploadProps {
  onSignatureChange: (base64Data: string | null) => void;
}

export function SignatureUpload({ onSignatureChange }: SignatureUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setError(
        t(
          'err_invalid_image_type',
          'Invalid file type. Please upload PNG, JPEG, or WEBP image.',
        ),
      );

      return;
    }

    // Validate size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setError(
        t(
          'err_file_too_large',
          'File size exceeds 2MB limit. Please select a smaller image.',
        ),
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Result = e.target?.result as string;

      setPreview(base64Result);
      onSignatureChange(base64Result);
    };
    reader.onerror = () => {
      setError(
        t(
          'err_failed_read_file',
          'Failed to process file. Please try another image.',
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onSignatureChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="bg-destructive/10 border-destructive/30 text-destructive flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {preview ? (
        <div className="border-border bg-input-background relative flex flex-col items-center justify-center rounded-xl border p-4 shadow-inner">
          <button
            type="button"
            onClick={handleRemove}
            className="bg-card/80 hover:bg-card text-foreground absolute right-3 top-3 rounded-full p-1.5 shadow-md backdrop-blur-sm transition-colors"
            title={t('btn_remove_upload', 'Remove uploaded image')}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex h-36 max-w-full items-center justify-center p-2">
            <img
              src={preview}
              alt={t('label_signature_preview', 'Signature Preview')}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            {t('msg_uploaded_ready', 'Image loaded ready to save')}
          </p>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-border bg-input-background hover:border-primary/50 group flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all"
        >
          <div className="bg-primary/10 mb-3 rounded-full p-3 transition-transform group-hover:scale-110">
            <UploadCloud className="text-primary h-6 w-6" />
          </div>

          <p className="text-sm font-medium">
            {t(
              'label_drag_drop_upload',
              'Click to upload or drag and drop signature image',
            )}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {t('label_accepted_formats', 'PNG, JPEG, or WEBP (Max 2MB)')}
          </p>
        </div>
      )}
    </div>
  );
}
