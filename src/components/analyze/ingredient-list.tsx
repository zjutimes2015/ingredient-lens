'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import type { IngredientDetailData } from './ingredient-detail';

interface IngredientItem {
  name: string;
  score: number;
  function: string;
  description?: string;
  concerns?: string[];
  benefits?: string[];
  pubmedRefs?: { title: string; url: string; year: number }[];
  skinMatch?: number; // 0-100 how well it matches user's skin profile
}

interface IngredientListProps {
  ingredients: IngredientItem[];
  onSelect: (ingredient: IngredientDetailData) => void;
  className?: string;
}

/**
 * IngredientList - Expandable list of ingredient cards
 *
 * Apple-style accordion where each ingredient shows:
 * - Name & function (always visible)
 * - Score badge (color-coded)
 * - Expandable details with description
 * - Click-through to full detail modal
 */
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
      : score >= 60
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
        color,
      )}
    >
      {score}
    </span>
  );
}

export function IngredientList({
  ingredients,
  onSelect,
  className,
}: IngredientListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!ingredients.length) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h3
        className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
      >
        Ingredients ({ingredients.length})
      </h3>

      {ingredients.map((item, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <motion.div
            key={`ingredient-${item.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={cn(
              'overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow',
              'hover:shadow-sm',
              item.skinMatch !== undefined && item.skinMatch < 30 && 'opacity-50',
            )}
          >
            {/* Header - always visible */}
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="flex w-full items-center gap-3 p-4 text-left"
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                  >
                    {item.name}
                  </p>
                  {item.skinMatch !== undefined && (
                    <span
                      className={cn(
                        'inline-block shrink-0 rounded-full border',
                        item.skinMatch >= 70
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : item.skinMatch >= 40
                            ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'border-red-300 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400',
                      )}
                      title={`Skin match: ${item.skinMatch}%`}
                    >
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium leading-none">
                        <span
                          className={cn(
                            'inline-block size-1.5 rounded-full',
                            item.skinMatch >= 70
                              ? 'bg-emerald-500'
                              : item.skinMatch >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500',
                          )}
                        />
                        {item.skinMatch}%
                      </span>
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.function}
                </p>
              </div>

              <ScoreBadge score={item.score} />

              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  isExpanded && 'rotate-180',
                )}
              />
            </button>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t px-4 py-3">
                    {item.description && (
                      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    {item.concerns && item.concerns.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-1 text-xs font-semibold text-red-500 uppercase tracking-wider">
                          Concerns
                        </p>
                        <ul className="space-y-0.5">
                          {item.concerns.map((c, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.benefits && item.benefits.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-1 text-xs font-semibold text-green-500 uppercase tracking-wider">
                          Benefits
                        </p>
                        <ul className="space-y-0.5">
                          {item.benefits.map((b, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-green-400" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect({
                          name: item.name,
                          score: item.score,
                          function: item.function,
                          description: item.description ?? '',
                          concerns: item.concerns ?? [],
                          benefits: item.benefits ?? [],
                          pubmedRefs: item.pubmedRefs ?? [],
                        });
                      }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <CircleHelp className="h-3 w-3" />
                      View full details & references
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
