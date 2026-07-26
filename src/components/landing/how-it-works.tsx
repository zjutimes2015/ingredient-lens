'use client';

import { motion } from 'motion/react';
import { Camera, Brain, FileText } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Snap a photo',
    description:
      'Take a picture of any ingredient list — product packaging, label, or screenshot. Our OCR extracts every component instantly.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI analyzes everything',
    description:
      'Our engine cross-references each ingredient against PubMed, clinical studies, and regulatory databases for comprehensive insights.',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Get clear results',
    description:
      'Receive safety scores, personalized recommendations, and explanations you can actually understand — no chemistry degree required.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function HowItWorks() {
  return (
    <section className="bg-neutral-50/50 py-28 dark:bg-neutral-950/50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            How it works
          </span>
          <h2 className="font-bricolage-grotesque mt-4 text-balance text-4xl font-light leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            Three simple steps to
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              ingredient clarity
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-8"
        >
          {/* Connecting line (desktop only) */}
          <div
            aria-hidden
            className="absolute left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] top-24 hidden h-px bg-gradient-to-r from-emerald-200/0 via-emerald-300/50 to-teal-200/0 md:block dark:from-emerald-800/0 dark:via-emerald-700/50 dark:to-teal-800/0"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number */}
              <span className="font-bricolage-grotesque text-6xl font-extralight leading-none text-neutral-200 dark:text-neutral-800">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:ring-neutral-800/50">
                <step.icon className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Title */}
              <h3 className="mt-5 font-bricolage-grotesque text-xl font-medium text-neutral-900 dark:text-white">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {step.description}
              </p>

              {/* Connector dot for mobile */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden
                  className="mt-8 flex items-center gap-1 md:hidden"
                >
                  <div className="size-1.5 rounded-full bg-emerald-300 dark:bg-emerald-700" />
                  <div className="size-1.5 rounded-full bg-emerald-300 dark:bg-emerald-700" />
                  <div className="size-1.5 rounded-full bg-emerald-300 dark:bg-emerald-700" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
