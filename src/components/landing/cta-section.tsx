'use client';

import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-white py-28 dark:bg-neutral-950">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_60%,rgba(16,185,129,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_40%_at_50%_60%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.04),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.06),transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-xl shadow-emerald-900/5 dark:border-emerald-900/30 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-teal-950/30 dark:shadow-black/20"
        >
          {/* Decorative elements */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-20 -inset-y-20"
          >
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/4 -translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.15),transparent_70%)]" />
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)]" />
          </div>

          {/* Floating sparkles */}
          <div
            aria-hidden
            className="absolute right-12 top-12 hidden sm:block"
          >
            <Sparkles className="size-6 text-emerald-300/60 dark:text-emerald-600/40" />
          </div>
          <div
            aria-hidden
            className="absolute bottom-12 left-12 hidden sm:block"
          >
            <Sparkles className="size-4 text-teal-300/40 dark:text-teal-600/30" />
          </div>

          <div className="relative px-8 py-20 text-center sm:px-16 sm:py-24">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-white/60 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <span className="flex size-2 rounded-full bg-emerald-500" />
              Start your journey
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-bricolage-grotesque text-balance text-4xl font-light leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl dark:text-white"
            >
              Ready to know exactly
              <br />
              what you're putting on your skin?
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-4 max-w-lg text-balance text-base leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              Join thousands of informed consumers who've taken control of
              their skincare routine. No credit card required.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition-all duration-300 hover:bg-neutral-800 hover:shadow-md active:scale-[0.97] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Start your first analysis
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1 rounded-full px-8 py-3.5 text-base font-medium text-neutral-600 transition-colors duration-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Learn more
                <span className="text-neutral-400">→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
