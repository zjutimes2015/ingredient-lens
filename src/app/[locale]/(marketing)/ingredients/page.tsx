import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import { getBaseUrl } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;

  return constructMetadata({
    title: 'Ingredients Database | Science-Backed Skincare Ingredient Analysis',
    description:
      'Browse our comprehensive database of 30+ skincare ingredients with PubMed-backed safety analysis, benefits, side effects, and expert usage guidelines.',
    locale,
    pathname: '/ingredients',
  });
}

export default async function IngredientsIndexPage() {
  const t = await getTranslations('IngredientsPage');
  const baseUrl = getBaseUrl();

  const ingredients = [
    { slug: 'niacinamide', name: 'Niacinamide' },
    { slug: 'retinol', name: 'Retinol' },
    { slug: 'hyaluronic-acid', name: 'Hyaluronic Acid' },
    { slug: 'vitamin-c', name: 'Vitamin C (Ascorbic Acid)' },
    { slug: 'salicylic-acid', name: 'Salicylic Acid' },
    { slug: 'glycolic-acid', name: 'Glycolic Acid' },
    { slug: 'lactic-acid', name: 'Lactic Acid' },
    { slug: 'azelaic-acid', name: 'Azelaic Acid' },
    { slug: 'benzoyl-peroxide', name: 'Benzoyl Peroxide' },
    { slug: 'squalane', name: 'Squalane' },
    { slug: 'ceramides', name: 'Ceramides' },
    { slug: 'peptides', name: 'Peptides' },
    { slug: 'tretinoin', name: 'Tretinoin' },
    { slug: 'adapalene', name: 'Adapalene' },
    { slug: 'zinc-oxide', name: 'Zinc Oxide' },
    { slug: 'titanium-dioxide', name: 'Titanium Dioxide' },
    { slug: 'avobenzone', name: 'Avobenzone' },
    { slug: 'coenzyme-q10', name: 'Coenzyme Q10' },
    { slug: 'green-tea-extract', name: 'Green Tea Extract' },
    { slug: 'aloe-vera', name: 'Aloe Vera' },
    { slug: 'glycerin', name: 'Glycerin' },
    { slug: 'shea-butter', name: 'Shea Butter' },
    { slug: 'kojic-acid', name: 'Kojic Acid' },
    { slug: 'arbutin', name: 'Arbutin' },
    { slug: 'tranexamic-acid', name: 'Tranexamic Acid' },
    { slug: 'centella-asiatica', name: 'Centella Asiatica' },
    { slug: 'allantoin', name: 'Allantoin' },
    { slug: 'panthenol', name: 'Panthenol (Vitamin B5)' },
    { slug: 'niacinamide-vitamin-c', name: 'Niacinamide + Vitamin C' },
    { slug: 'retinol-peptides', name: 'Retinol + Peptides' },
  ];

  return (
    <Container className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Skincare Ingredients Database
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Science-backed analysis of 30+ popular skincare ingredients.
          Each page includes PubMed references, safety scores, and expert
          usage guidelines.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => (
            <Link
              key={ingredient.slug}
              href={`/ingredients/${ingredient.slug}`}
              className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card hover:bg-accent/50"
            >
              <h2 className="font-semibold text-foreground">
                {ingredient.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                View ingredient analysis &rarr;
              </p>
            </Link>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Skincare Ingredients Database',
              description:
                'Browse our comprehensive database of skincare ingredients with PubMed-backed safety analysis.',
              url: `${baseUrl}/ingredients`,
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: ingredients.map((ing, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `${baseUrl}/ingredients/${ing.slug}`,
                  name: ing.name,
                })),
              },
            }),
          }}
        />
      </div>
    </Container>
  );
}
