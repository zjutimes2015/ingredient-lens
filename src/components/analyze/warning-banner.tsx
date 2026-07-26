'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export interface Warning {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
}

interface WarningBannerProps {
  warnings: Warning[];
  className?: string;
}

const iconMap = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    text: 'text-red-800 dark:text-red-200',
    desc: 'text-red-600 dark:text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
    text: 'text-yellow-800 dark:text-yellow-200',
    desc: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    text: 'text-blue-800 dark:text-blue-200',
    desc: 'text-blue-600 dark:text-blue-400',
  },
};

/**
 * WarningBanner - Displays analysis warnings in an Apple-style card
 *
 * Supports three severity levels:
 * - critical: Red, prominent (for harmful ingredients)
 * - warning: Yellow, moderate (for potentially concerning ingredients)
 * - info: Blue, informative (for informational notices)
 */
export function WarningBanner({ warnings, className }: WarningBannerProps) {
  if (!warnings.length) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {warnings.map((warning, index) => {
        const Icon = iconMap[warning.type];
        const colors = colorMap[warning.type];
        const MotionIcon = motion.create(Icon);

        return (
          <motion.div
            key={`warning-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4',
              colors.bg,
              colors.border,
            )}
          >
            <MotionIcon
              className={cn('mt-0.5 h-5 w-5 shrink-0', colors.icon)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: index * 0.1 }}
            />
            <div className="space-y-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  colors.text,
                )}
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {warning.title}
              </p>
              <p className={cn('text-sm', colors.desc)}>
                {warning.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
