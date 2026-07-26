'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

/**
 * ScoreRing - Apple-style circular score indicator
 *
 * Renders an SVG circle with animated fill based on the score.
 * Color transitions: green (>=80), yellow (60-79), red (<60)
 */
export function ScoreRing({
  score,
  size = 180,
  strokeWidth = 10,
  className,
  label,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const color =
    clampedScore >= 80
      ? { stroke: '#22c55e', text: 'text-green-500', bg: 'text-green-100' }
      : clampedScore >= 60
        ? { stroke: '#eab308', text: 'text-yellow-500', bg: 'text-yellow-100' }
        : { stroke: '#ef4444', text: 'text-red-500', bg: 'text-red-100' };

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(clampedScore), 100);
    return () => clearTimeout(timer);
  }, [clampedScore]);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={color.bg}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={cn(
              'text-4xl font-bold tracking-tight',
              color.text,
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {Math.round(clampedScore)}
          </motion.span>
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
