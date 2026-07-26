'use client';

import { motion } from 'motion/react';
import {
  FlaskConical,
  Sparkles,
  ShieldCheck,
  BadgeInfo,
} from 'lucide-react';

const features = [
  {
    icon: FlaskConical,
    title: 'Science-backed analysis',
    description:
      'Every ingredient is cross-referenced against PubMed and peer-reviewed studies. No marketing fluff — just real data you can trust.',
    gradient: 'from-emerald-500 to-teal-400',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/30',
  },
  {
    icon: Sparkles,
    title: 'Personalized skin matching',
    description:
      'Tell us your skin type, concerns, and sensitivities. We tailor every recommendation to what actually works for your unique skin.',
    gradient: 'from-violet-500 to-purple-400',
    lightBg: 'bg-violet-50',
    darkBg: 'dark:bg-violet-950/30',
  },
  {
    icon: ShieldCheck,
    title: 'Clear safety scores',
    description:
      'Each ingredient gets a 0–10 safety score based on toxicity, irritation potential, and regulatory status. Green means go.',
    gradient: 'from-emerald-500 to-teal-400',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/30',
  },
  {
    icon: BadgeInfo,
    title: 'Zero brand bias',
    description:
      'We don\'t sell products or take sponsorships. Our analysis is 100% independent — the only agenda is your health.',
    gradient: 'from-amber-500 to-orange-400',
    lightBg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/30',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeaturesSection() {
  return (
    <section className="bg-white py-28 dark:bg-neutral-950">
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
            Features
          </span>
          <h2 className="font-bricolage-grotesque mt-4 text-balance text-4xl font-light leading-[1.15] tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              decode your skincare
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
            Powerful tools designed to give you complete transparency over
            what you put on your skin.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm shadow-neutral-900/5 transition-all duration-300 hover:shadow-md hover:shadow-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/10 dark:hover:shadow-black/20"
            >
              {/* Icon */}
              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${feature.lightBg} ${feature.darkBg} ring-1 ring-neutral-200/50 dark:ring-neutral-700/50`}
              >
                <feature.icon className="size-6 text-neutral-700 dark:text-neutral-300" />
              </div>

              {/* Title */}
              <h3 className="font-bricolage-grotesque mt-5 text-xl font-medium text-neutral-900 dark:text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {feature.description}
              </p>

              {/* Decorative gradient */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-20 -inset-y-20 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              >
                <div
                  className={`absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_0%,rgba(16,185,129,0.04),transparent)] dark:bg-[radial-gradient(ellipse_50%_30%_at_50%_0%,rgba(16,185,129,0.06),transparent)]`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 gap-6 rounded-3xl border border-neutral-100 bg-neutral-50/50 px-8 py-10 dark:border-neutral-800 dark:bg-neutral-900/50 sm:grid-cols-4"
        >
          {[
            { value: '50K+', label: 'Ingredients analyzed' },
            { value: '2M+', label: 'PubMed references' },
            { value: '99.9%', label: 'Accuracy rate' },
            { value: '0', label: 'Brand affiliations' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bricolage-grotesque text-3xl font-light text-neutral-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
