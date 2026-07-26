'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  Upload,
  Camera,
  FileText,
  Clipboard,
  Sparkles,
} from 'lucide-react';
import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

interface UploadZoneProps {
  onImageUpload: (file: File) => void;
  onPasteIngredients: (text: string) => void;
  isAnalyzing?: boolean;
  className?: string;
}

/**
 * UploadZone - Apple-style drag-and-drop upload area
 *
 * Features:
 * - Drag & drop image upload
 * - Camera capture button
 * - Paste ingredients from clipboard
 * - Dashed border with gradient on hover
 * - Glass-morphism loading state
 */
export function UploadZone({
  onImageUpload,
  onPasteIngredients,
  isAnalyzing = false,
  className,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handlePasteSubmit = () => {
    if (pasteText.trim()) {
      onPasteIngredients(pasteText.trim());
      setPasteText('');
      setShowPasteInput(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main drop zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging
            ? 'rgb(59, 130, 246)'
            : 'rgb(209, 213, 219)',
          backgroundColor: isDragging
            ? 'rgba(59, 130, 246, 0.05)'
            : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-shadow',
          'hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/20',
          'dark:border-neutral-700 dark:hover:border-blue-500',
          isDragging && 'shadow-lg shadow-blue-200/30',
          isAnalyzing && 'pointer-events-none',
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload ingredient photo"
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3">
            {/* Glass loading */}
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm ring-1 ring-black/5 dark:bg-neutral-800/80">
                <Sparkles className="h-6 w-6 animate-pulse text-blue-500" />
              </div>
            </div>
            <p
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Analyzing ingredients...
            </p>
            <p className="text-xs text-muted-foreground">
              This usually takes a few seconds
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p
                className="text-base font-semibold"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Drop your ingredient list here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WEBP
            </p>
          </>
        )}
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isAnalyzing}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-all',
            'hover:bg-muted/50 hover:shadow-sm',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <Camera className="h-4 w-4" />
          Upload Photo
        </button>

        <button
          onClick={() => setShowPasteInput(!showPasteInput)}
          disabled={isAnalyzing}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-all',
            'hover:bg-muted/50 hover:shadow-sm',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <Clipboard className="h-4 w-4" />
          Paste Ingredients
        </button>
      </div>

      {/* Paste text input */}
      <motion.div
        initial={false}
        animate={{
          height: showPasteInput ? 'auto' : 0,
          opacity: showPasteInput ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span
              className="text-xs font-medium text-muted-foreground"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Paste ingredient list
            </span>
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="e.g. Water, Glycerin, Niacinamide, Hyaluronic Acid..."
            rows={3}
            className={cn(
              'w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none transition-colors',
              'placeholder:text-muted-foreground/50',
              'focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30',
            )}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowPasteInput(false);
                setPasteText('');
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!pasteText.trim()}
              className={cn(
                'rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors',
                'hover:bg-blue-600',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              Analyze
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
