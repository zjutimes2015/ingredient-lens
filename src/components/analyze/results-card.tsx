'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface ResultsCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * ResultsCard - White card wrapper for analysis results
 *
 * Apple-style floating card with subtle shadow and rounded corners.
 * Used as a container for score, warnings, and ingredient list sections.
 */
export function ResultsCard({
  title,
  children,
  className,
}: ResultsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl border bg-card p-6 shadow-sm',
        'dark:bg-neutral-900',
        className,
      )}
    >
      {title && (
        <h2
          className="mb-4 text-lg font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  );
}
