import { RotateCcw, Pen } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface SignatureCanvasProps {
  onSignatureChange: (base64Data: string | null) => void;
  width?: number;
  height?: number;
}

export function SignatureCanvas({
  onSignatureChange,
  width = 600,
  height = 200,
}: SignatureCanvasProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [penColor, setPenColor] = useState('#0F172A'); // slate-900

  // Initialize canvas context
  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    return ctx;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();

    if (!canvas || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onSignatureChange(null);
  }, [getCanvasContext, onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    // Set line attributes
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
    }
  }, [penColor]);

  // Coordinate retrieval helper
  const getCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];

      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const ctx = getCanvasContext();

    if (!ctx) {
      return;
    }

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) {
      return;
    }

    e.preventDefault();
    const ctx = getCanvasContext();

    if (!ctx) {
      return;
    }

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) {
      return;
    }

    const ctx = getCanvasContext();

    if (ctx) {
      ctx.closePath();
    }

    setIsDrawing(false);

    const canvas = canvasRef.current;

    if (canvas && hasContent) {
      const dataUrl = canvas.toDataURL('image/png');

      onSignatureChange(dataUrl);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pen className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">
            {t('label_draw_pad', 'Draw your signature inside the box')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Color Selectors */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPenColor('#0F172A')}
              className={`h-5 w-5 rounded-full border bg-slate-900 transition-all ${
                penColor === '#0F172A'
                  ? 'ring-primary scale-110 ring-2 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title={t('color_dark', 'Dark')}
            />
            <button
              type="button"
              onClick={() => setPenColor('#1E40AF')}
              className={`h-5 w-5 rounded-full border bg-blue-800 transition-all ${
                penColor === '#1E40AF'
                  ? 'ring-primary scale-110 ring-2 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title={t('color_blue', 'Blue')}
            />
          </div>

          <button
            type="button"
            onClick={clearCanvas}
            disabled={!hasContent}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t('btn_clear_canvas', 'Clear')}</span>
          </button>
        </div>
      </div>

      <div className="border-border bg-input-background relative overflow-hidden rounded-xl border border-dashed shadow-inner transition-colors">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="h-[200px] w-full cursor-crosshair touch-none"
        />

        {!hasContent && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground/40 select-none text-sm font-medium">
              {t('msg_sign_here', 'Sign here...')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
