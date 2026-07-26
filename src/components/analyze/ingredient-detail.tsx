'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Beaker } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ScoreRing } from './score-ring';

export interface IngredientDetailData {
  name: string;
  score: number;
  function: string;
  description: string;
  concerns: string[];
  benefits: string[];
  pubmedRefs: { title: string; url: string; year: number }[];
}

interface IngredientDetailProps {
  ingredient: IngredientDetailData | null;
  onClose: () => void;
}

/**
 * IngredientDetail - Modal dialog for ingredient deep-dive info
 *
 * Apple-style sheet that slides up from the bottom with
 * detailed information about a single ingredient.
 */
export function IngredientDetail({
  ingredient,
  onClose,
}: IngredientDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (ingredient) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [ingredient, onClose]);

  return (
    <AnimatePresence>
      {ingredient && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl',
              'dark:bg-neutral-900',
              'sm:rounded-2xl sm:mx-4',
              'max-h-[85vh] overflow-y-auto',
            )}
            role="dialog"
            aria-modal="true"
            aria-label={`Ingredient details: ${ingredient.name}`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <ScoreRing score={ingredient.score} size={64} strokeWidth={6} />
              <div>
                <h2
                  className="text-xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  {ingredient.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {ingredient.function}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {ingredient.description}
            </p>

            {/* Concerns */}
            {ingredient.concerns.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                  Concerns
                </h3>
                <ul className="space-y-1">
                  {ingredient.concerns.map((concern, i) => (
                    <li
                      key={`concern-${i}`}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {ingredient.benefits.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  Benefits
                </h3>
                <ul className="space-y-1">
                  {ingredient.benefits.map((benefit, i) => (
                    <li
                      key={`benefit-${i}`}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PubMed References */}
            {ingredient.pubmedRefs.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Beaker className="h-3.5 w-3.5 text-blue-500" />
                  PubMed References
                </h3>
                <div className="space-y-2">
                  {ingredient.pubmedRefs.map((ref, i) => (
                    <a
                      key={`ref-${i}`}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors',
                        'hover:bg-muted/50',
                      )}
                    >
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                      <div>
                        <p className="text-foreground">{ref.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ref.year}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
