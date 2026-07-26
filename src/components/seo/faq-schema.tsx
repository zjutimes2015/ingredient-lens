import { websiteConfig } from '@/config/website'
import type { Locale } from 'next-intl'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  items: FAQItem[]
}

/**
 * FAQ Schema - Google Rich Results + GEO for AI Search
 * 
 * GEO (Generative Engine Optimization): 
 * AI search engines (Perplexity, ChatGPT Search, Gemini)
 * prefer pages with structured FAQ data for featured snippets.
 * 
 * Usage:
 * <FAQSchema items={[
 *   { question: "Is retinol safe?", answer: "Based on PubMed studies..." }
 * ]} />
 */
export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Product Schema - for ingredient analysis result pages
 */
export function ProductSchema({
  name,
  description,
  brand,
  sku,
}: {
  name: string
  description: string
  brand?: string
  sku?: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    ...(brand && { brand: { '@type': 'Brand', name: brand } }),
    ...(sku && { sku }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * HowTo Schema - step by step for ingredient analysis
 * GEO optimization: AI search engines use HowTo schema to generate step-by-step answers
 */
export function HowToSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to analyze skincare ingredients with AI',
    description: 'Use IngredientLens to scan any cosmetic product ingredient list and get PubMed-backed safety analysis.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Upload a photo',
        text: 'Take a photo of the ingredient list on your product packaging, or paste the INCI ingredient list manually.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'AI analyzes every ingredient',
        text: 'Our AI cross-references each ingredient against PubMed research, safety databases, and clinical studies.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Get your safety report',
        text: 'Receive a detailed analysis with safety scores, skin type compatibility, and links to published research.',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Breadcrumb Schema
 */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
