'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  FlaskConical,
  ChevronRight,
  History,
  FileText,
} from 'lucide-react';

import { UploadZone } from '@/components/analyze/upload-zone';
import { ScoreRing } from '@/components/analyze/score-ring';
import { WarningBanner, type Warning } from '@/components/analyze/warning-banner';
import { IngredientList } from '@/components/analyze/ingredient-list';
import {
  IngredientDetail,
  type IngredientDetailData,
} from '@/components/analyze/ingredient-detail';
import { ResultsCard } from '@/components/analyze/results-card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// ── Types ────────────────────────────────────────────────────────

interface AnalyzeResult {
  overallScore: number;
  productName?: string;
  warnings: Warning[];
  ingredients: {
    name: string;
    score: number;
    function: string;
    description?: string;
    concerns?: string[];
    benefits?: string[];
    pubmedRefs?: { title: string; url: string; year: number }[];
  }[];
}

type PageState = 'empty' | 'loading' | 'results' | 'error';

// ── Mock data for development ────────────────────────────────────

const MOCK_RESULTS: AnalyzeResult = {
  overallScore: 74,
  productName: 'Hydrating Facial Serum',
  warnings: [
    {
      type: 'critical',
      title: 'Contains Fragrance Allergen',
      description:
        'Limonene is listed among the top 5 ingredients. This is a common allergen that may cause skin irritation in sensitive individuals.',
    },
    {
      type: 'warning',
      title: 'Moderate Alcohol Content',
      description:
        'Denatured Alcohol (Alcohol Denat.) is present. May cause dryness with prolonged use, especially for dry or sensitive skin types.',
    },
    {
      type: 'info',
      title: 'Contains Beneficial Antioxidants',
      description:
        'Vitamin E (Tocopherol) and Vitamin C (Ascorbic Acid) are present, offering protection against environmental stressors.',
    },
  ],
  ingredients: [
    {
      name: 'Water (Aqua)',
      score: 100,
      function: 'Solvent',
      description:
        'Purified water acts as the base solvent that dissolves other ingredients and creates the desired consistency of the product.',
      benefits: ['Universal solvent', 'Hydration base'],
      concerns: [],
      pubmedRefs: [],
    },
    {
      name: 'Glycerin',
      score: 95,
      function: 'Humectant',
      description:
        'A naturally occurring humectant that attracts moisture to the skin. One of the most well-studied and safe skincare ingredients.',
      benefits: [
        'Deeply hydrating',
        'Helps skin barrier function',
        'Non-comedogenic',
      ],
      concerns: [],
      pubmedRefs: [
        {
          title:
            'Glycerol and the skin: holistic approach to its role in skin health',
          url: 'https://pubmed.ncbi.nlm.nih.gov/18489335/',
          year: 2008,
        },
      ],
    },
    {
      name: 'Niacinamide (Vitamin B3)',
      score: 90,
      function: 'Skin-restoring agent',
      description:
        'A form of vitamin B3 that helps strengthen the skin barrier, reduce inflammation, and improve uneven skin tone.',
      benefits: [
        'Reduces redness and blotchiness',
        'Minimizes pore appearance',
        'Improves skin barrier',
      ],
      concerns: [],
      pubmedRefs: [
        {
          title:
            'Niacinamide: A B vitamin that improves aging facial skin appearance',
          url: 'https://pubmed.ncbi.nlm.nih.gov/16120036/',
          year: 2005,
        },
      ],
    },
    {
      name: 'Limonene',
      score: 45,
      function: 'Fragrance component',
      description:
        'A terpene found in citrus peel oils used for fragrance. While natural, it is a common skin allergen and can cause photo-sensitivity.',
      benefits: ['Natural scent', 'Antioxidant properties'],
      concerns: [
        'Common allergen',
        'May cause contact dermatitis',
        'Photo-sensitizing',
      ],
      pubmedRefs: [
        {
          title:
            'Fragrance allergens in cosmetic products: a survey of current trends',
          url: 'https://pubmed.ncbi.nlm.nih.gov/23557089/',
          year: 2013,
        },
      ],
    },
    {
      name: 'Alcohol Denat.',
      score: 35,
      function: 'Solvent / Astringent',
      description:
        'Denatured alcohol used as a solvent and quick-drying agent. Can disrupt the skin barrier with frequent use.',
      benefits: ['Quick absorption', 'Astringent effect'],
      concerns: [
        'Strips natural oils',
        'Can cause dryness',
        'May disrupt skin barrier',
      ],
      pubmedRefs: [
        {
          title:
            'The effect of alcohol on the skin barrier: a systematic review',
          url: 'https://pubmed.ncbi.nlm.nih.gov/30810234/',
          year: 2019,
        },
      ],
    },
    {
      name: 'Tocopherol (Vitamin E)',
      score: 92,
      function: 'Antioxidant',
      description:
        'A fat-soluble antioxidant that helps protect skin cells from oxidative stress and environmental damage.',
      benefits: [
        'Powerful antioxidant',
        'Moisturizing',
        'Helps repair skin',
      ],
      concerns: [],
      pubmedRefs: [
        {
          title:
            'Vitamin E in dermatology: a comprehensive review',
          url: 'https://pubmed.ncbi.nlm.nih.gov/23181511/',
          year: 2012,
        },
      ],
    },
    {
      name: 'Phenoxyethanol',
      score: 70,
      function: 'Preservative',
      description:
        'A common cosmetic preservative used to prevent microbial growth. Considered safe at concentrations up to 1%.',
      benefits: ['Prevents contamination', 'Extends shelf life'],
      concerns: [
        'May cause mild irritation in sensitive individuals',
      ],
      pubmedRefs: [
        {
          title:
            'Safety assessment of phenoxyethanol as used in cosmetics',
          url: 'https://pubmed.ncbi.nlm.nih.gov/19028417/',
          year: 2008,
        },
      ],
    },
  ],
};

// ── Page Component ───────────────────────────────────────────────

export default function AnalyzePage() {
  const t = useTranslations();
  const [pageState, setPageState] = useState<PageState>('empty');
  const [results, setResults] = useState<AnalyzeResult | null>(null);
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientDetailData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = useCallback(
    async (input: string | File) => {
      setPageState('loading');
      setErrorMessage('');

      try {
        // Simulate API call for now — replace with real endpoint
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // TODO: Replace with actual API call:
        // const formData = new FormData();
        // formData.append('ingredients', input);
        // const res = await fetch('/api/analyze', { method: 'POST', body: formData });
        // const data = await res.json();

        setResults(MOCK_RESULTS);
        setPageState('results');
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Analysis failed. Please try again.',
        );
        setPageState('error');
      }
    },
    [],
  );

  // Empty state component
  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30">
        <FlaskConical className="h-8 w-8 text-blue-500" />
      </div>
      <h1
        className="mb-2 text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
      >
        Ingredient Analysis
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Upload a photo of your product&apos;s ingredient list or paste the
        ingredients to get an AI-powered safety and efficacy analysis.
      </p>

      <UploadZone
        onImageUpload={(file) => handleAnalyze(file)}
        onPasteIngredients={(text) => handleAnalyze(text)}
        className="w-full"
      />
    </motion.div>
  );

  // Loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      {/* Glass morphing loader */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-blue-400 to-green-400 opacity-20" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/70 backdrop-blur-xl ring-1 ring-black/5 dark:bg-neutral-800/70">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-8 w-8 text-blue-500" />
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Analyzing ingredients
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Scanning for safety, efficacy, and concerns...
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-blue-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );

  // Results state
  const renderResults = () => {
    if (!results) return null;

    const scoreColor =
      results.overallScore >= 80
        ? 'text-green-600 dark:text-green-400'
        : results.overallScore >= 60
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400';

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left column — results overview */}
        <div className="space-y-6 lg:col-span-3">
          {/* Score & product name */}
          <ResultsCard>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ScoreRing score={results.overallScore} size={140} strokeWidth={8} />
              <div className="text-center sm:text-left">
                {results.productName && (
                  <p
                    className="text-sm font-medium text-muted-foreground"
                    style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                  >
                    {results.productName}
                  </p>
                )}
                <h2
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    scoreColor,
                  )}
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  {results.overallScore >= 80
                    ? 'Good Choice'
                    : results.overallScore >= 60
                      ? 'Moderate'
                      : 'Poor'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {results.overallScore >= 80
                    ? 'This product has a generally safe and effective ingredient profile.'
                    : results.overallScore >= 60
                      ? 'This product is acceptable but contains some ingredients worth noting.'
                      : 'This product contains several concerning ingredients worth reviewing.'}
                </p>
              </div>
            </div>
          </ResultsCard>

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <ResultsCard title="Alerts & Notes">
              <WarningBanner warnings={results.warnings} />
            </ResultsCard>
          )}

          {/* Ingredient list */}
          <ResultsCard>
            <IngredientList
              ingredients={results.ingredients}
              onSelect={setSelectedIngredient}
            />
          </ResultsCard>
        </div>

        {/* Right column — summary / sidebar */}
        <div className="space-y-6 lg:col-span-2">
          <ResultsCard title="Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Ingredients
                </span>
                <span className="text-lg font-bold">
                  {results.ingredients.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Safe (&ge;80)
                </span>
                <span className="text-lg font-bold text-green-500">
                  {
                    results.ingredients.filter((i) => i.score >= 80).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Moderate (60-79)
                </span>
                <span className="text-lg font-bold text-yellow-500">
                  {
                    results.ingredients.filter(
                      (i) => i.score >= 60 && i.score < 80,
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Concerning (&lt;60)
                </span>
                <span className="text-lg font-bold text-red-500">
                  {
                    results.ingredients.filter((i) => i.score < 60).length
                  }
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quick Tips
                  </span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                    Look for products with ingredients scoring 80+
                  </li>
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                    Red-flagged ingredients may still be safe at low concentrations
                  </li>
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                    Click any ingredient for full details and PubMed references
                  </li>
                </ul>
              </div>
            </div>
          </ResultsCard>

          <ResultsCard title="Actions">
            <button
              onClick={() => {
                setResults(null);
                setPageState('empty');
              }}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white transition-all',
                'hover:bg-blue-600 hover:shadow-md',
              )}
            >
              <FileText className="h-4 w-4" />
              Analyze Another Product
            </button>
          </ResultsCard>
        </div>
      </div>
    );
  };

  // Error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <FlaskConical className="h-6 w-6 text-red-500" />
      </div>
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        {errorMessage || 'Something went wrong'}
      </p>
      <button
        onClick={() => setPageState('empty')}
        className="rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
      >
        Try Again
      </button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-green-500">
                <FlaskConical className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1
                  className="text-lg font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  Analyze Ingredients
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered cosmetic ingredient analysis
                </p>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="px-4 lg:px-6">
            {pageState === 'empty' && renderEmptyState()}
            {pageState === 'loading' && renderLoadingState()}
            {pageState === 'results' && renderResults()}
            {pageState === 'error' && renderErrorState()}
          </div>
        </div>
      </div>

      {/* Ingredient detail modal */}
      <IngredientDetail
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />
    </div>
  );
}
