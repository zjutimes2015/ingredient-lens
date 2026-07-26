'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';

interface SkinQuizResult {
  dryness: string;
  sensitivity: string;
  concern: string;
  climate: string;
  allergens: string[];
}

interface SkinQuizProps {
  onComplete?: (result: SkinQuizResult) => void;
  className?: string;
}

const QUESTIONS = [
  {
    id: 'dryness',
    question: 'One hour after washing, how does your skin feel?',
    options: [
      { value: 'dry', label: 'Tight & flaky', emoji: '\u{1F3DC}\uFE0F' },
      { value: 'oil', label: 'Shiny all over', emoji: '\u{1F4A7}' },
      { value: 'combination', label: 'T-zone oily, cheeks dry', emoji: '\u{1F313}' },
      { value: 'normal', label: 'Comfortable, not dry or oily', emoji: '\u2728' },
    ],
  },
  {
    id: 'sensitivity',
    question: 'Do your skincare products often sting or burn?',
    options: [
      { value: 'sensitive', label: 'Yes, frequently', emoji: '\u{1F525}' },
      { value: 'mild', label: 'Sometimes', emoji: '\u{1F324}\uFE0F' },
      { value: 'resistant', label: 'Never', emoji: '\u{1F6E1}\uFE0F' },
    ],
  },
  {
    id: 'concern',
    question: 'What is your primary skin concern?',
    options: [
      { value: 'aging', label: 'Fine lines & wrinkles', emoji: '\u{1F52C}' },
      { value: 'acne', label: 'Breakouts & clogged pores', emoji: '\u{1F534}' },
      { value: 'pigmentation', label: 'Dark spots & uneven tone', emoji: '\u{1F311}' },
      { value: 'redness', label: 'Redness & irritation', emoji: '\u{1F912}' },
    ],
  },
  {
    id: 'climate',
    question: 'What is your local climate?',
    options: [
      { value: 'dry', label: 'Arid / Dry', emoji: '\u2600\uFE0F' },
      { value: 'humid', label: 'Humid / Tropical', emoji: '\u{1F334}' },
      { value: 'temperate', label: 'Temperate / Four seasons', emoji: '\u{1F342}' },
    ],
  },
  {
    id: 'allergens',
    question: 'Any known ingredient allergies?',
    note: 'Select all that apply',
    options: [
      { value: 'fragrance', label: 'Fragrance / Parfum', emoji: '\u{1F338}' },
      { value: 'alcohol', label: 'Alcohol', emoji: '\u{1F9EA}' },
      { value: 'paraben', label: 'Parabens', emoji: '\u26A0\uFE0F' },
      { value: 'none', label: 'None that I know of', emoji: '\u2705' },
    ],
    multiSelect: true,
  },
];

function computeSkinProfile(answers: Record<string, string | string[]>) {
  const parts: string[] = [];

  // Determine skin type from dryness
  if (answers.dryness === 'dry') parts.push('Dry Skin');
  else if (answers.dryness === 'oil') parts.push('Oily Skin');
  else if (answers.dryness === 'combination') parts.push('Combination Skin');
  else parts.push('Normal Skin');

  // Sensitivity
  if (answers.sensitivity === 'sensitive') parts.push('Sensitive');
  else if (answers.sensitivity === 'mild') parts.push('Mild Sensitivity');
  else parts.push('Resilient');

  // Primary concern
  const concernMap: Record<string, string> = {
    aging: 'Anti-Aging Focus',
    acne: 'Acne-Prone Focus',
    pigmentation: 'Brightening Focus',
    redness: 'Soothing Focus',
  };
  parts.push(concernMap[answers.concern as string] || 'Balanced Focus');

  return {
    label: parts.join(' \u00B7 '),
    summary: `Your skin tends toward ${answers.dryness as string}ness with ${answers.sensitivity as string} reactivity and a primary concern of ${answers.concern as string}.`,
    matches: parts,
  };
}

export function SkinQuiz({ onComplete, className }: SkinQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof computeSkinProfile> | null>(null);

  const currentQuestion = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;
  const totalQuestions = QUESTIONS.length;

  const handleSelect = useCallback(
    (questionId: string, value: string, multiSelect?: boolean) => {
      if (multiSelect) {
        const current = (answers[questionId] as string[]) || [];
        if (value === 'none') {
          // Selecting 'none' clears other selections
          setAnswers((prev) => ({ ...prev, [questionId]: ['none'] }));
        } else {
          const filtered = current.filter((v) => v !== 'none');
          const next = filtered.includes(value)
            ? filtered.filter((v) => v !== value)
            : [...filtered, value];
          setAnswers((prev) => ({ ...prev, [questionId]: next.length ? next : ['none'] }));
        }
      } else {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
      }
    },
    [answers],
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      const result: SkinQuizResult = {
        dryness: answers.dryness as string,
        sensitivity: answers.sensitivity as string,
        concern: answers.concern as string,
        climate: answers.climate as string,
        allergens: (answers.allergens as string[]) || [],
      };
      const computedProfile = computeSkinProfile(answers);
      setProfile(computedProfile);
      setCompleted(true);

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ingredientlens_skin_profile', JSON.stringify(result));
      }

      onComplete?.(result);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, answers, onComplete]);

  const canAdvance = () => {
    const answer = answers[currentQuestion?.id ?? ''];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  };

  // Completed view
  if (completed && profile) {
    return (
      <div className={cn('w-full', className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-white/70 p-8 shadow-lg shadow-emerald-900/5 backdrop-blur-xl dark:border-emerald-800/30 dark:bg-neutral-900/70 dark:shadow-emerald-900/10"
        >
          {/* Decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-20 -z-10 opacity-30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.2),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.15),transparent)]" />
          </div>

          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50"
            >
              <Sparkles className="size-8 text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-bricolage-grotesque text-2xl font-semibold text-neutral-900 dark:text-white"
            >
              Your Skin Profile
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              {profile.summary}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {profile.matches.map((m, i) => (
                <span
                  key={i}
                  className="rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                >
                  {m}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-xs text-neutral-400 dark:text-neutral-500"
            >
              Results saved to your profile. Ingredient analysis will now be personalized.
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress dots */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === currentStep
                ? 'w-6 bg-emerald-500'
                : i < currentStep
                  ? 'w-2 bg-emerald-300 dark:bg-emerald-600'
                  : 'w-2 bg-neutral-200 dark:bg-neutral-700',
            )}
          />
        ))}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/70 p-6 shadow-lg shadow-neutral-900/5 backdrop-blur-xl dark:border-neutral-800/30 dark:bg-neutral-900/70 sm:p-8"
        >
          {/* Glass shine */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-20 -z-10 opacity-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(255,255,255,0.3),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(255,255,255,0.05),transparent)]" />
          </div>

          {/* Question number */}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Step {currentStep + 1} of {totalQuestions}
          </p>

          <h3 className="font-bricolage-grotesque text-xl font-semibold text-neutral-900 dark:text-white">
            {currentQuestion.question}
          </h3>

          {currentQuestion.note && (
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              {currentQuestion.note}
            </p>
          )}

          {/* Options */}
          <div className="mt-5 space-y-2.5">
            {currentQuestion.options.map((option) => {
              const isSelected = Array.isArray(answers[currentQuestion.id])
                ? (answers[currentQuestion.id] as string[]).includes(option.value)
                : answers[currentQuestion.id] === option.value;

              const isNoneOption = option.value === 'none';
              const isDisabled =
                isNoneOption &&
                Array.isArray(answers[currentQuestion.id]) &&
                (answers[currentQuestion.id] as string[]).length > 0 &&
                !(answers[currentQuestion.id] as string[]).includes('none');

              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleSelect(currentQuestion.id, option.value, currentQuestion.multiSelect)
                  }
                  disabled={!!isDisabled}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200',
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/30'
                      : 'border-neutral-200 bg-white/50 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600 dark:hover:bg-neutral-800',
                    isDisabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg dark:bg-neutral-800">
                    {option.emoji}
                  </span>
                  <span className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {option.label}
                  </span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500"
                    >
                      <Check className="size-3.5 text-white" />
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next / Done button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200',
                canAdvance()
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200'
                  : 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600',
              )}
            >
              {isLast ? 'See Results' : 'Next'}
              <span className="text-xs">{isLast ? '\u2728' : '\u2192'}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
