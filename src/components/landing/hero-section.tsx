'use client';

import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-neutral-950">
      {/* Subtle gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/4 translate-x-1/4 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.06),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-32 pt-20 sm:pt-28 lg:pt-36">
        <div className="mx-auto max-w-5xl text-center">
          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50/50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            <span className="flex size-2 rounded-full bg-emerald-500" />
            AI-Powered Ingredient Analysis
          </motion.div>

          {/* Main headline - Apple style: large, light weight */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bricolage-grotesque text-balance text-5xl font-light leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-8xl dark:text-white"
          >
            Know exactly what's in
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
              your skincare
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-neutral-500 sm:text-xl dark:text-neutral-400"
          >
            Snap a photo of any ingredient list. Our AI cross-references every
            component with PubMed research, giving you clear safety scores and
            personalized recommendations.
          </motion.p>

          {/* Trust badge row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-400 dark:text-neutral-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-1 rounded-full bg-emerald-400" />
              Powered by PubMed research
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-1 rounded-full bg-emerald-400" />
              100% brand-independent
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-1 rounded-full bg-emerald-400" />
              Updated weekly
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-full bg-neutral-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-all duration-300 hover:bg-neutral-800 hover:shadow-md active:scale-[0.97] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Camera className="size-5" />
              Start Analysis
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-8 py-3.5 text-base font-medium text-neutral-700 transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            >
              How it works
              <span className="text-neutral-400">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Hero visual - placeholder with rounded screenshot frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-xl shadow-neutral-900/5 dark:border-neutral-800/60 dark:bg-neutral-900 dark:shadow-black/20">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-1.5 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 rounded-full bg-neutral-100 px-4 py-1.5 text-xs text-neutral-400 dark:bg-neutral-800">
                ingredientlens.app
              </div>
            </div>

            {/* Mock content */}
            <div className="space-y-4 p-8 sm:p-12">
              {/* Simulated ingredient analysis card */}
              <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-sm dark:border-emerald-900/30 dark:from-emerald-950/30 dark:to-neutral-900">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        SAFE
                      </span>
                    </div>
                    <h3 className="mt-2 font-bricolage-grotesque text-xl font-medium text-neutral-900 dark:text-white">
                      Hyaluronic Acid
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Hydration · Anti-aging · PubMed cited: 2,341 studies
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    9.2
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    ✓ Well-Studied
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                    ✓ Pregnancy-Safe
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                    ⚠ Low Irritation Risk
                  </span>
                </div>
              </div>

              {/* Second row of ingredient cards */}
              <div className="mx-auto flex max-w-2xl gap-4">
                <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      CAUTION
                    </span>
                  </div>
                  <p className="mt-2 font-bricolage-grotesque text-sm font-medium text-neutral-900 dark:text-white">
                    Fragrance
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Score: 4.8 · Moderate risk
                  </p>
                </div>
                <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      SAFE
                    </span>
                  </div>
                  <p className="mt-2 font-bricolage-grotesque text-sm font-medium text-neutral-900 dark:text-white">
                    Glycerin
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Score: 8.9 · Well-studied
                  </p>
                </div>
              </div>

              {/* Bottom gradient fade */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-neutral-950" />
            </div>
          </div>

          {/* Glow effect behind the mockup */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -inset-y-20 -z-10 opacity-40"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.15),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(16,185,129,0.2),transparent)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
