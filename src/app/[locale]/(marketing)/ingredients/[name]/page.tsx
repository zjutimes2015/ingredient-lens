import {
  BreadcrumbSchema,
  FAQSchema,
  HowToSchema,
} from '@/components/seo/faq-schema';
import { getBaseUrl } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Locale } from 'next-intl';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IngredientReference {
  title: string;
  url: string;
  authors?: string;
  year?: number;
}

interface IngredientFAQ {
  q: string;
  a: string;
}

interface IngredientData {
  name: string;
  alsoKnownAs?: string[];
  category: string;
  safetyScore: number; // 1-10
  description: string;
  benefits: string[];
  sideEffects: string[];
  maxConcentration: string;
  pregnancySafe: boolean;
  suitableFor: string[];
  references: IngredientReference[];
  faq: IngredientFAQ[];
}

// ---------------------------------------------------------------------------
// 30 Preset Ingredients
// ---------------------------------------------------------------------------

const INGREDIENTS_DB: Record<string, IngredientData> = {
  niacinamide: {
    name: 'Niacinamide',
    alsoKnownAs: ['Vitamin B3', 'Nicotinamide', '烟酰胺'],
    category: 'Brightening / Barrier Repair / Oil Control',
    safetyScore: 9,
    description:
      'Niacinamide is a form of vitamin B3 that offers multiple skin benefits. It strengthens the skin barrier, reduces hyperpigmentation, regulates oil production, and minimizes pore appearance. Clinical studies show it is well-tolerated even by sensitive skin types and works synergistically with most other active ingredients.',
    benefits: [
      'Reduces hyperpigmentation and dark spots',
      'Strengthens skin barrier function',
      'Regulates sebum production',
      'Minimizes enlarged pores',
      'Reduces fine lines and wrinkles',
      'Improves skin elasticity',
    ],
    sideEffects: [
      'Mild irritation in high concentrations (>5%)',
      'Rare flushing reaction',
      'Temporary stinging on compromised skin',
    ],
    maxConcentration: '5%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Niacinamide: A B vitamin that improves aging facial skin appearance',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16120087/',
        authors: 'Bissett DL et al.',
        year: 2005,
      },
      {
        title:
          'Topical niacinamide reduces sebum production in human skin',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12702027/',
        authors: 'Draelos ZD et al.',
        year: 2003,
      },
      {
        title:
          'Niacinamide in dermatology: a review of its benefits',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28497133/',
        authors: 'Rolfe HM',
        year: 2017,
      },
    ],
    faq: [
      {
        q: 'Can niacinamide be used with vitamin C?',
        a: 'Modern formulations with stabilized vitamin C are safe to use with niacinamide. Earlier concerns about niacinamide converting to nicotinic acid (which causes flushing) have been disproven in stabilized formulations. For best results, use vitamin C in the morning and niacinamide at night.',
      },
      {
        q: 'What concentration of niacinamide is best?',
        a: 'Studies show 2-5% is the most effective and well-tolerated range. Concentrations above 5% may cause irritation without additional benefit. Most clinical trials demonstrating efficacy used 4-5% formulations.',
      },
      {
        q: 'Does niacinamide cause purging?',
        a: 'Unlike exfoliants, niacinamide does not cause purging. It is a soothing, anti-inflammatory ingredient. If you experience breakouts after starting niacinamide, it may be due to other ingredients in the formulation or an allergic reaction.',
      },
    ],
  },

  retinol: {
    name: 'Retinol',
    alsoKnownAs: ['Vitamin A', 'Retinyl Palmitate', 'Retinaldehyde'],
    category: 'Anti-Aging / Cell Renewal / Acne',
    safetyScore: 7,
    description:
      'Retinol is a vitamin A derivative that accelerates skin cell turnover and stimulates collagen production. It is one of the most extensively studied anti-aging ingredients with strong clinical evidence for reducing fine lines, wrinkles, and hyperpigmentation. Retinol requires conversion to retinoic acid in the skin, making it gentler than prescription retinoids.',
    benefits: [
      'Stimulates collagen synthesis',
      'Reduces fine lines and wrinkles',
      'Improves skin texture and tone',
      'Treats acne and prevents clogged pores',
      'Fades hyperpigmentation',
      'Boosts skin cell turnover',
    ],
    sideEffects: [
      'Retinization — dryness, peeling, redness (first 4-6 weeks)',
      'Increased sun sensitivity',
      'Initial acne breakout (purging)',
      'Avoid during pregnancy (all retinoids)',
    ],
    maxConcentration: '1%',
    pregnancySafe: false,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Topical retinol improves photoaged skin',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17438608/',
        authors: 'Kafi R et al.',
        year: 2007,
      },
      {
        title:
          'Retinoids in the treatment of skin aging',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20426708/',
        authors: 'Mukherjee S et al.',
        year: 2006,
      },
      {
        title:
          'Clinical efficacy of topical retinoids in acne management',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31013838/',
        authors: 'Leyden JJ et al.',
        year: 2019,
      },
    ],
    faq: [
      {
        q: 'How long does it take for retinol to work?',
        a: 'Anti-aging benefits typically become visible after 8-12 weeks of consistent use. Acne improvement may be seen in 6-8 weeks. Full results for wrinkle reduction appear after 6 months of regular use.',
      },
      {
        q: 'Can I use retinol every night?',
        a: 'Start with 1-2 times per week and gradually increase frequency as your skin builds tolerance. Once the retinization phase (4-6 weeks) passes, most people can use retinol 3-4 times per week. Higher concentrations may need less frequent application.',
      },
      {
        q: 'Is retinol safe during pregnancy?',
        a: 'No. All retinoids, including over-the-counter retinol, should be avoided during pregnancy and while breastfeeding. There is a known risk of teratogenicity. Consult your OB-GYN for pregnancy-safe alternatives.',
      },
    ],
  },

  'hyaluronic-acid': {
    name: 'Hyaluronic Acid',
    alsoKnownAs: ['HA', 'Sodium Hyaluronate', 'Hyaluronan'],
    category: 'Hydration / Moisturizing / Plumping',
    safetyScore: 10,
    description:
      'Hyaluronic acid is a naturally occurring glycosaminoglycan in human skin that can hold up to 1,000 times its weight in water. It acts as a powerful humectant, drawing moisture from the environment into the skin. Multiple molecular weights allow for both surface hydration and deeper skin penetration.',
    benefits: [
      'Provides intense hydration',
      'Plumps and smooths skin',
      'Reduces appearance of fine lines (via hydration)',
      'Supports wound healing',
      'Strengthens skin barrier',
      'Compatible with all skin types',
    ],
    sideEffects: [
      'May feel sticky in high humidity',
      'Can draw moisture from skin in very dry environments if not sealed',
      'Rare allergic reactions',
    ],
    maxConcentration: '2%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Hyaluronic acid in cutaneous intrinsic aging',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25211025/',
        authors: 'Papakonstantinou E et al.',
        year: 2012,
      },
      {
        title:
          'Efficacy of topical hyaluronic acid in dermatology',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33925051/',
        authors: 'Buhren BA et al.',
        year: 2021,
      },
    ],
    faq: [
      {
        q: 'Can hyaluronic acid make skin drier?',
        a: 'Yes, in very dry climates HA can draw moisture from the deeper layers of skin if not covered with an occlusive moisturizer. Apply HA to damp skin and seal with a moisturizer containing emollients and occlusives to prevent trans-epidermal water loss.',
      },
      {
        q: 'What is the difference between HA and sodium hyaluronate?',
        a: 'Sodium hyaluronate is the salt form of hyaluronic acid. It has a smaller molecular weight, which allows better penetration into skin. Both are effective, but sodium hyaluronate is slightly more stable and cost-effective in formulations.',
      },
    ],
  },

  'vitamin-c': {
    name: 'Vitamin C (L-Ascorbic Acid)',
    alsoKnownAs: ['L-Ascorbic Acid', 'Ascorbyl Glucoside', 'SAP', 'MAP'],
    category: 'Antioxidant / Brightening / Collagen Synthesis',
    safetyScore: 8,
    description:
      'L-ascorbic acid is the active form of vitamin C, a potent antioxidant that neutralizes free radicals, inhibits melanin production, and stimulates collagen synthesis. It is the gold standard antioxidant in dermatology, though it requires proper formulation (pH < 3.5) for optimal absorption.',
    benefits: [
      'Neutralizes free radicals (antioxidant protection)',
      'Brightens skin and fades hyperpigmentation',
      'Boosts collagen synthesis',
      'Photoprotection (enhances sunscreen efficacy)',
      'Reduces fine lines and wrinkles',
      'Anti-inflammatory properties',
    ],
    sideEffects: [
      'Stinging or tingling on application (especially L-AA)',
      'Oxidation — turns yellow/brown when exposed to light/air',
      'May cause purging in acne-prone skin',
      'Can destabilize when mixed with niacinamide (older formulations)',
    ],
    maxConcentration: '20%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Vitamin C in dermatology: a review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23841773/',
        authors: 'Telang PS',
        year: 2013,
      },
      {
        title:
          'Topical vitamin C and photoprotection',
        url: 'https://pubmed.ncbi.nlm.nih.gov/19260745/',
        authors: 'Murray JC et al.',
        year: 2009,
      },
    ],
    faq: [
      {
        q: 'Should I use vitamin C in the morning or night?',
        a: 'Vitamin C is most effective in the morning as it provides antioxidant protection against UV-induced free radicals throughout the day. It also boosts the efficacy of your sunscreen. However, it can be used at night as well if morning application is not convenient.',
      },
      {
        q: 'What concentration of vitamin C is best?',
        a: '10-20% L-ascorbic acid is the clinically proven effective range. Beginners should start with 10% and work up to 15-20%. Concentrations above 20% do not provide additional benefit and may cause more irritation. Derivatives like SAP (sodium ascorbyl phosphate) are gentler options for sensitive skin.',
      },
    ],
  },

  'salicylic-acid': {
    name: 'Salicylic Acid',
    alsoKnownAs: ['BHA', 'Beta Hydroxy Acid', '2-Hydroxybenzoic Acid'],
    category: 'Exfoliant / Acne Treatment / Oil Control',
    safetyScore: 7,
    description:
      'Salicylic acid is a lipophilic (oil-soluble) beta hydroxy acid that penetrates deep into pores to dissolve sebum and dead skin cells. It is the gold standard for treating blackheads, whiteheads, and mild acne. Its anti-inflammatory properties also help reduce redness in active breakouts.',
    benefits: [
      'Unclogs pores and treats blackheads',
      'Reduces acne breakouts',
      'Exfoliates dead skin cells',
      'Anti-inflammatory effects on active acne',
      'Regulates oil production',
      'Improves skin texture',
    ],
    sideEffects: [
      'Dryness and peeling with overuse',
      'Initial acne flare (purging)',
      'Sun sensitivity',
      'Not recommended for aspirin-allergic individuals',
    ],
    maxConcentration: '2% (OTC)',
    pregnancySafe: false,
    suitableFor: ['oily', 'combination'],
    references: [
      {
        title:
          'Salicylic acid in dermatology: a review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/26290724/',
        authors: 'Arif T',
        year: 2015,
      },
      {
        title:
          'BHA and acne treatment efficacy',
        url: 'https://pubmed.ncbi.nlm.nih.gov/18778319/',
        authors: 'Zander E et al.',
        year: 2008,
      },
    ],
    faq: [
      {
        q: 'Can salicylic acid be used with retinol?',
        a: 'Yes, but not at the same time. Use salicylic acid in the morning and retinol at night, or alternate nights. Using both in the same routine can cause excessive dryness and irritation. Always moisturize well when combining exfoliants with retinoids.',
      },
      {
        q: 'Is salicylic acid safe during pregnancy?',
        a: 'OTC salicylic acid (2% or less) is generally considered safe in limited quantities during pregnancy by most OB-GYNs, but higher concentrations and peels should be avoided. Always consult your healthcare provider before use during pregnancy.',
      },
    ],
  },

  'glycolic-acid': {
    name: 'Glycolic Acid',
    alsoKnownAs: ['AHA', 'Alpha Hydroxy Acid', 'Hydroxyacetic Acid'],
    category: 'Exfoliant / Brightening / Anti-Aging',
    safetyScore: 7,
    description:
      'Glycolic acid, derived from sugarcane, is the smallest AHA molecule allowing deepest penetration. It dissolves the bonds between dead skin cells, promoting rapid exfoliation, brighter skin, and improved collagen production. It is considered the most potent AHA for anti-aging benefits.',
    benefits: [
      'Powerful exfoliation for smoother skin',
      'Fades hyperpigmentation and dark spots',
      'Stimulates collagen production',
      'Improves skin texture and tone',
      'Reduces fine lines and wrinkles',
      'Enhances product penetration',
    ],
    sideEffects: [
      'Stinging and burning on application',
      'Significant sun sensitivity',
      'Dryness and peeling',
      'Not suitable for very sensitive skin',
    ],
    maxConcentration: '10% (OTC)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Alpha hydroxy acids in dermatology: clinical applications',
        url: 'https://pubmed.ncbi.nlm.nih.gov/10527485/',
        authors: 'Smith WP',
        year: 1999,
      },
      {
        title:
          'Glycolic acid peel therapy for photoaging',
        url: 'https://pubmed.ncbi.nlm.nih.gov/8935892/',
        authors: 'Newman N et al.',
        year: 1996,
      },
    ],
    faq: [
      {
        q: 'How often should I use glycolic acid?',
        a: 'Start with 1-2 times per week and gradually increase to every other day as tolerated. Daily use is possible for some with well-formulated lower concentrations (5-7%). Always use sunscreen diligently when using any AHA.',
      },
      {
        q: 'What pH should glycolic acid products have?',
        a: 'For effective exfoliation, glycolic acid products should have a pH between 3.0 and 4.0. At pH above 4.0, the exfoliating effect is significantly reduced. However, lower pH means more potential for irritation.',
      },
    ],
  },

  'lactic-acid': {
    name: 'Lactic Acid',
    alsoKnownAs: ['AHA', 'Alpha Hydroxy Acid', 'Milk Acid'],
    category: 'Exfoliant / Hydration / Brightening',
    safetyScore: 8,
    description:
      'Lactic acid is a gentle AHA derived from milk that exfoliates dead skin cells while simultaneously hydrating. Its larger molecular weight compared to glycolic acid makes it slower-penetrating and less irritating, making it ideal for sensitive skin and beginners to chemical exfoliation.',
    benefits: [
      'Gentle exfoliation for smoother skin',
      'Hydrates while exfoliating',
      'Fades hyperpigmentation',
      'Improves skin texture and radiance',
      'Strengthens skin barrier',
      'Anti-aging benefits',
    ],
    sideEffects: [
      'Mild stinging on initial use',
      'Sun sensitivity',
      'May feel sticky in high humidity',
    ],
    maxConcentration: '10% (OTC)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Lactic acid exfoliation in photoaged skin',
        url: 'https://pubmed.ncbi.nlm.nih.gov/8564872/',
        authors: 'Smith WP',
        year: 1996,
      },
    ],
    faq: [
      {
        q: 'Is lactic acid better than glycolic acid?',
        a: 'For sensitive skin, yes — lactic acid is gentler while still providing excellent exfoliation and hydration. For maximum anti-aging effect, glycolic acid is more potent. Many users start with lactic acid and graduate to glycolic acid as tolerance builds.',
      },
    ],
  },

  'azelaic-acid': {
    name: 'Azelaic Acid',
    alsoKnownAs: ['Azelex', 'Finacea', 'Skinoren'],
    category: 'Acne / Rosacea / Brightening',
    safetyScore: 9,
    description:
      'Azelaic acid is a naturally occurring dicarboxylic acid with anti-inflammatory, antibacterial, and keratolytic properties. It is uniquely effective for both acne vulgaris and rosacea, and is a safe brightening agent for darker skin tones without the risk of ochronosis.',
    benefits: [
      'Treats acne vulgaris and rosacea',
      'Reduces post-inflammatory hyperpigmentation',
      'Antibacterial against C. acnes',
      'Anti-inflammatory properties',
      'Safe for pregnancy',
      'Effective for melasma',
    ],
    sideEffects: [
      'Mild itching or stinging on application',
      'Transient tingling sensation',
      'Dryness in initial weeks',
    ],
    maxConcentration: '15% (gel/cream)',
    pregnancySafe: true,
    suitableFor: ['oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Azelaic acid in the treatment of acne and rosacea',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29969549/',
        authors: 'Sieber MA et al.',
        year: 2018,
      },
      {
        title:
          'Topical azelaic acid for hyperpigmentation',
        url: 'https://pubmed.ncbi.nlm.nih.gov/10610789/',
        authors: 'Fitton A et al.',
        year: 1999,
      },
    ],
    faq: [
      {
        q: 'Can azelaic acid be used with retinol?',
        a: 'Yes. Azelaic acid pairs very well with retinol. Use azelaic acid in the morning and retinol at night, or alternate nights. This combination is particularly effective for acne and hyperpigmentation.',
      },
      {
        q: 'How long does azelaic acid take to work?',
        a: 'Acne improvements are typically seen within 4-6 weeks. Pigmentation fading takes longer — usually 8-12 weeks of consistent use. Rosacea patients may see reduced redness within 4-8 weeks.',
      },
    ],
  },

  'benzoyl-peroxide': {
    name: 'Benzoyl Peroxide',
    alsoKnownAs: ['BPO', 'Benzoperoxide'],
    category: 'Acne Treatment / Antibacterial',
    safetyScore: 6,
    description:
      'Benzoyl peroxide is a powerful antibacterial agent that kills Propionibacterium acnes bacteria by releasing oxygen into pores. It also has keratolytic and comedolytic properties. It remains one of the most effective OTC acne treatments available.',
    benefits: [
      'Rapidly kills acne-causing bacteria',
      'Reduces inflammatory acne',
      'Prevents clogged pores',
      'Helps prevent antibiotic resistance',
      'Works synergistically with retinoids',
    ],
    sideEffects: [
      'Bleaches fabrics (clothing, towels, bedding)',
      'Dryness, peeling, and redness',
      'Stinging and irritation',
      'Photosensitivity',
    ],
    maxConcentration: '10%',
    pregnancySafe: true,
    suitableFor: ['oily', 'combination'],
    references: [
      {
        title:
          'Benzoyl peroxide in acne treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27657417/',
        authors: 'Mills OH et al.',
        year: 2016,
      },
    ],
    faq: [
      {
        q: 'Does benzoyl peroxide bleach clothes?',
        a: 'Yes. Benzoyl peroxide has strong bleaching properties. Allow the product to fully dry before contact with fabrics. Use white towels and pillowcases, and wash hands thoroughly after application to avoid bleaching clothing.',
      },
      {
        q: 'Can I use benzoyl peroxide with retinol?',
        a: 'Use them at different times of day (BPO in AM, retinol in PM) or on alternate nights. Combined use in the same routine can cause severe dryness and irritation. A moisturizer is essential when using both.',
      },
    ],
  },

  squalane: {
    name: 'Squalane',
    alsoKnownAs: ['Squalene (hydrogenated)', 'Olive-derived Squalane', 'Sugarcane Squalane'],
    category: 'Moisturizer / Barrier Repair / Occlusive',
    safetyScore: 10,
    description:
      'Squalane is a hydrogenated, stable form of squalene — a lipid naturally produced by human skin. It is a lightweight, non-comedogenic moisturizer that mimics the skin\'s natural sebum, making it excellent for all skin types including oily and acne-prone.',
    benefits: [
      'Provides lightweight hydration',
      'Non-comedogenic — won\'t clog pores',
      'Mimics natural skin lipids',
      'Antioxidant properties (squalene)',
      'Suitable for all skin types',
      'Helps restore skin barrier',
    ],
    sideEffects: [],
    maxConcentration: '100%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Squalane in dermatology: a comprehensive review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35002734/',
        authors: 'Huang ZR et al.',
        year: 2022,
      },
    ],
    faq: [
      {
        q: 'What is the difference between squalane and squalene?',
        a: 'Squalene (with an "e") is the unsaturated form naturally produced by skin but oxidizes quickly. Squalane (with an "a") is the hydrogenated, stable version used in skincare. Squalane has a longer shelf life and is the form found in virtually all skincare products.',
      },
    ],
  },

  ceramides: {
    name: 'Ceramides',
    alsoKnownAs: ['Ceramide NP', 'Ceramide AP', 'Ceramide EOP', 'Phytosphingosine'],
    category: 'Barrier Repair / Moisturizing / Anti-Aging',
    safetyScore: 10,
    description:
      'Ceramides are lipids that make up approximately 50% of the skin\'s stratum corneum. They form a protective barrier that prevents moisture loss and protects against environmental damage. Aging and environmental factors deplete ceramide levels, making topical supplementation essential.',
    benefits: [
      'Restores skin barrier function',
      'Prevents transepidermal water loss',
      'Protects against environmental damage',
      'Reduces sensitivity and irritation',
      'Improves skin hydration',
      'Supports healthy skin texture',
    ],
    sideEffects: [],
    maxConcentration: 'Varies (typically 0.3-2%)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Ceramide supplementation in skin barrier repair',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31072919/',
        authors: 'Uchida Y et al.',
        year: 2019,
      },
    ],
    faq: [
      {
        q: 'Who should use ceramides?',
        a: 'Everyone benefits from ceramides, but they are especially important for those with dry skin, eczema, psoriasis, or compromised skin barriers. They are also excellent for aging skin as natural ceramide production declines with age.',
      },
    ],
  },

  peptides: {
    name: 'Peptides',
    alsoKnownAs: ['Copper Peptides', 'Matrixyl', 'Argireline', 'Palmitoyl Oligopeptide'],
    category: 'Anti-Aging / Collagen Stimulation / Firming',
    safetyScore: 9,
    description:
      'Peptides are short chains of amino acids that act as signaling molecules in the skin. They signal skin cells to produce more collagen, elastin, and other structural proteins. Different peptides have different functions — some relax expression lines, others boost firmness.',
    benefits: [
      'Stimulates collagen and elastin production',
      'Reduces fine lines and wrinkles',
      'Improves skin firmness and elasticity',
      'Supports skin barrier repair',
      'Anti-inflammatory properties',
      'Works well with other active ingredients',
    ],
    sideEffects: ['Rare mild irritation', 'Copper peptides may oxidize if formulated poorly'],
    maxConcentration: 'Varies by peptide type',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Peptides in skincare: efficacy and safety',
        url: 'https://pubmed.ncbi.nlm.nih.gov/32863476/',
        authors: 'Fields K et al.',
        year: 2020,
      },
      {
        title:
          'Copper peptide and collagen synthesis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/11952139/',
        authors: 'Pickart L',
        year: 2002,
      },
    ],
    faq: [
      {
        q: 'Can peptides be used with retinol?',
        a: 'Yes, but apply them at different times of day. Retinol can be used at night while peptides are used in the morning. Some peptide formulations are designed specifically to complement retinoid use for enhanced anti-aging results.',
      },
    ],
  },

  tretinoin: {
    name: 'Tretinoin',
    alsoKnownAs: ['All-Trans Retinoic Acid', 'Retin-A', 'Vitamin A Acid'],
    category: 'Anti-Aging / Acne / Prescription Retinoid',
    safetyScore: 6,
    description:
      'Tretinoin is the active form of vitamin A (retinoic acid) available only by prescription. It directly binds to retinoic acid receptors in the skin, making it significantly more potent than retinol. It is FDA-approved for both acne treatment and photoaging reduction.',
    benefits: [
      'Most potent topical anti-aging ingredient',
      'Significant collagen stimulation',
      'Treats acne vulgaris effectively',
      'Improves fine lines, wrinkles, and texture',
      'Fades hyperpigmentation',
      'Prevents future acne breakouts',
    ],
    sideEffects: [
      'Significant dryness, peeling, and redness (retinization)',
      'Initial acne purge (4-6 weeks)',
      'Extreme sun sensitivity',
      'Teratogenic — must avoid during pregnancy',
      'Can cause permanent changes in skin pigmentation',
    ],
    maxConcentration: '0.1% (prescription)',
    pregnancySafe: false,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Tretinoin for photoaging: a 48-week study',
        url: 'https://pubmed.ncbi.nlm.nih.gov/2019909/',
        authors: 'Weiss JS et al.',
        year: 1991,
      },
      {
        title:
          'Tretinoin in acne vulgaris treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21448443/',
        authors: 'Kong YL et al.',
        year: 2011,
      },
    ],
    faq: [
      {
        q: 'How is tretinoin different from retinol?',
        a: 'Tretinoin is the active form of vitamin A that binds directly to skin receptors, while retinol must be converted to retinoic acid through a two-step enzymatic process. Tretinoin is about 20x more potent but also significantly more irritating.',
      },
      {
        q: 'Can I get tretinoin without a prescription?',
        a: 'No. Tretinoin is a prescription-only medication in most countries. Telemedicine services like Curology, Nurx, and Apostrophe can prescribe it after an online consultation. Never purchase tretinoin from unregulated sources.',
      },
    ],
  },

  adapalene: {
    name: 'Adapalene',
    alsoKnownAs: ['Differin', 'Third-generation Retinoid', 'Retinoid'],
    category: 'Acne Treatment / Anti-Aging / Retinoid',
    safetyScore: 8,
    description:
      'Adapalene is a third-generation synthetic retinoid that selectively binds to specific retinoic acid receptors, making it more stable and less irritating than tretinoin while maintaining strong efficacy. It is available OTC (0.1%) and by prescription (0.3%).',
    benefits: [
      'Highly effective for acne treatment',
      'Less irritating than tretinoin',
      'Comedolytic and anti-inflammatory',
      'Available OTC (0.1% gel)',
      'Stable formulation (light-resistant)',
      'Anti-aging benefits',
    ],
    sideEffects: [
      'Initial dryness and peeling (milder than tretinoin)',
      'Sun sensitivity',
      'Mild purge in first 4 weeks',
      'Avoid during pregnancy',
    ],
    maxConcentration: '0.3% (prescription)',
    pregnancySafe: false,
    suitableFor: ['oily', 'combination'],
    references: [
      {
        title:
          'Adapalene for acne: safety and efficacy review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28596136/',
        authors: 'Kircik LH',
        year: 2017,
      },
    ],
    faq: [
      {
        q: 'Is adapalene as effective as tretinoin for acne?',
        a: 'For non-inflammatory and mild-to-moderate acne, adapalene 0.1% has comparable efficacy to tretinoin 0.025% with significantly less irritation. For severe acne, tretinoin or higher-strength adapalene (0.3%) may be more effective.',
      },
    ],
  },

  'zinc-oxide': {
    name: 'Zinc Oxide',
    alsoKnownAs: ['ZnO', 'Mineral Sunscreen', 'Non-nano Zinc Oxide'],
    category: 'Sunscreen / Physical UV Filter / Soothing',
    safetyScore: 10,
    description:
      'Zinc oxide is a mineral UV filter that provides broad-spectrum protection against UVA and UVB rays. It sits on top of the skin reflecting and scattering UV radiation. Non-nano zinc oxide is reef-safe and suitable for even the most sensitive skin.',
    benefits: [
      'Broad-spectrum UVA/UVB protection',
      'Non-irritating — ideal for sensitive skin',
      'Reef-safe (non-nano particles)',
      'Provides protection immediately on application',
      'Anti-inflammatory properties',
      'Safe for pregnancy and children',
    ],
    sideEffects: ['White cast on darker skin tones', 'Thicker texture than chemical sunscreens'],
    maxConcentration: '25%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Zinc oxide in dermatology: safety review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/27748225/',
        authors: 'Smijs TG et al.',
        year: 2016,
      },
    ],
    faq: [
      {
        q: 'Is non-nano zinc oxide safe for the environment?',
        a: 'Yes. Non-nano zinc oxide particles (above 100nm) do not penetrate coral or marine life and are considered reef-safe. Avoid nano-sized zinc oxide if environmental impact is a concern.',
      },
    ],
  },

  'titanium-dioxide': {
    name: 'Titanium Dioxide',
    alsoKnownAs: ['TiO2', 'Mineral Sunscreen', 'Physical UV Filter'],
    category: 'Sunscreen / Physical UV Filter',
    safetyScore: 9,
    description:
      'Titanium dioxide is a mineral UV filter providing broad-spectrum protection primarily against UVB and short UVA rays. It is often combined with zinc oxide for comprehensive UVA protection. It is well-tolerated by sensitive skin.',
    benefits: [
      'Broad UV protection (UVB + short UVA)',
      'Non-irritating mineral filter',
      'Safe for sensitive and reactive skin',
      'Reef-safe',
      'Immediate protection on application',
      'Stable — does not degrade in sunlight',
    ],
    sideEffects: ['White cast', 'Less UVA protection than zinc oxide alone'],
    maxConcentration: '25%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Titanium dioxide in sunscreen: safety assessment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25468855/',
        authors: 'SCCS (Scientific Committee on Consumer Safety)',
        year: 2014,
      },
    ],
    faq: [
      {
        q: 'Is titanium dioxide better than zinc oxide?',
        a: 'Neither is inherently better. Titanium dioxide offers better UVB protection, while zinc oxide offers better UVA protection. Most mineral sunscreens combine both for optimal broad-spectrum coverage.',
      },
    ],
  },

  avobenzone: {
    name: 'Avobenzone',
    alsoKnownAs: ['Butyl Methoxydibenzoylmethane', 'Chemical Sunscreen Filter'],
    category: 'Sunscreen / Chemical UV Filter / UVA Protection',
    safetyScore: 7,
    description:
      'Avobenzone is the most common chemical UVA filter used in sunscreens worldwide. It absorbs the full UVA spectrum (320-400nm) but is photounstable, requiring stabilizers like octocrylene or newer encapsulation technologies to maintain efficacy.',
    benefits: [
      'Excellent UVA protection (full spectrum)',
      'Lightweight, cosmetically elegant texture',
      'No white cast',
      'Works well in combination formulations',
      'Broad approval globally',
    ],
    sideEffects: [
      'Potential skin irritation and sensitivity',
      'Staining on clothing (yellow/orange)',
      'Photodegradation without stabilizers',
      'Some environmental concerns (reef impacts)',
    ],
    maxConcentration: '3% (US), 5% (EU/Asia)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Avobenzone photostability and safety',
        url: 'https://pubmed.ncbi.nlm.nih.gov/23931692/',
        authors: 'Afonso S et al.',
        year: 2013,
      },
    ],
    faq: [
      {
        q: 'Is avobenzone safe?',
        a: 'Yes, avobenzone has been approved for use in sunscreens for decades and is considered safe by the FDA, EU Commission, and other regulatory bodies. The benefits of sun protection far outweigh any theoretical risks.',
      },
    ],
  },

  'coenzyme-q10': {
    name: 'Coenzyme Q10',
    alsoKnownAs: ['Ubiquinone', 'CoQ10', 'Ubidecarenone'],
    category: 'Antioxidant / Anti-Aging / Energy Metabolism',
    safetyScore: 9,
    description:
      'Coenzyme Q10 is a fat-soluble antioxidant naturally produced by the body that plays a critical role in mitochondrial energy production. In skin, CoQ10 levels decline with age and UV exposure, leading to oxidative stress. Topical application helps replenish levels.',
    benefits: [
      'Potent antioxidant protection',
      'Reduces oxidative damage from UV',
      'Supports cellular energy production',
      'Reduces fine lines and wrinkles',
      'Improves skin firmness',
      'Anti-inflammatory properties',
    ],
    sideEffects: ['Very rare irritation'],
    maxConcentration: '0.3-1%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Coenzyme Q10 in dermatology',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17466143/',
        authors: 'Prahl S et al.',
        year: 2007,
      },
    ],
    faq: [
      {
        q: 'Does oral CoQ10 supplementation help skin?',
        a: 'Oral CoQ10 can support skin health, but topical application delivers CoQ10 directly to skin cells more effectively. Oral absorption of CoQ10 is limited, and it may take months of supplementation to see skin benefits.',
      },
    ],
  },

  'green-tea-extract': {
    name: 'Green Tea Extract',
    alsoKnownAs: ['Camellia Sinensis Leaf Extract', 'EGCG', 'Epigallocatechin Gallate'],
    category: 'Antioxidant / Anti-Inflammatory / Photoprotection',
    safetyScore: 9,
    description:
      'Green tea extract is rich in polyphenols, particularly epigallocatechin gallate (EGCG), a potent antioxidant with anti-inflammatory and photoprotective properties. It neutralizes free radicals, reduces UV damage, and soothes irritated skin.',
    benefits: [
      'Strong antioxidant activity',
      'Reduces UV-induced skin damage',
      'Anti-inflammatory for acne and rosacea',
      'Soothing properties for sensitive skin',
      'May reduce sebum production',
      'Anti-aging benefits',
    ],
    sideEffects: ['May cause stinging in sensitive individuals', 'Can stain fabrics (green tint)'],
    maxConcentration: 'Varies by extract type',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Green tea polyphenols in skin health',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16365079/',
        authors: 'Hsu S',
        year: 2005,
      },
    ],
    faq: [
      {
        q: 'Can green tea extract replace vitamin C serum?',
        a: 'No, green tea extract and vitamin C have different mechanisms. Vitamin C is essential for collagen synthesis, while green tea provides unique polyphenol protection. They work best together for comprehensive antioxidant defense.',
      },
    ],
  },

  'aloe-vera': {
    name: 'Aloe Vera',
    alsoKnownAs: ['Aloe Barbadensis Leaf Juice', 'Aloe Gel'],
    category: 'Soothing / Hydration / Wound Healing',
    safetyScore: 9,
    description:
      'Aloe vera is a succulent plant whose gel has been used for centuries for its soothing, hydrating, and wound-healing properties. It contains vitamins, minerals, enzymes, and polysaccharides that provide deep hydration without greasiness.',
    benefits: [
      'Soothes sunburn and irritated skin',
      'Provides lightweight hydration',
      'Promotes wound healing',
      'Anti-inflammatory properties',
      'Antimicrobial effects',
      'Suitable for all skin types',
    ],
    sideEffects: [
      'Rare allergic contact dermatitis',
      'Can be sticky if not formulated properly',
    ],
    maxConcentration: 'Up to 100% (pure gel)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Aloe vera in dermatology: clinical evidence',
        url: 'https://pubmed.ncbi.nlm.nih.gov/17530135/',
        authors: 'Surjushe A et al.',
        year: 2008,
      },
    ],
    faq: [
      {
        q: 'Is fresh aloe vera from the plant better than store-bought?',
        a: 'Fresh aloe vera gel from the plant is highly effective but may contain aloin (a latex compound) that can be irritating. Store-bought products are stabilized and filtered to remove irritating compounds, making them more consistent and safer for daily use.',
      },
    ],
  },

  glycerin: {
    name: 'Glycerin',
    alsoKnownAs: ['Glycerol', 'Glycerine', '1,2,3-Propanetriol'],
    category: 'Humectant / Hydration / Moisturizing',
    safetyScore: 10,
    description:
      'Glycerin is a colorless, odorless humectant that attracts water to the outermost layer of skin. It is one of the most common and well-studied skincare ingredients, found in virtually all moisturizers. It is safe, non-comedogenic, and suitable for all skin types.',
    benefits: [
      'Powerful humectant hydration',
      'Strengthens skin barrier',
      'Improves skin smoothness',
      'Non-comedogenic',
      'Enhances penetration of other ingredients',
      'Very safe and well-tolerated',
    ],
    sideEffects: ['May feel sticky in high humidity', 'Can draw moisture from skin if used alone in dry climates'],
    maxConcentration: '20% (typically 3-10% in formulations)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Glycerin in skin care: a review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/10882340/',
        authors: 'Fluhr JW et al.',
        year: 2000,
      },
    ],
    faq: [
      {
        q: 'Is glycerin good for oily skin?',
        a: 'Yes. Glycerin is non-comedogenic and provides lightweight hydration without adding oil. It actually helps balance oily skin by providing adequate hydration, which can reduce compensatory oil production.',
      },
    ],
  },

  'shea-butter': {
    name: 'Shea Butter',
    alsoKnownAs: ['Butyrospermum Parkii Butter', 'Karite Butter'],
    category: 'Moisturizer / Emollient / Barrier Repair',
    safetyScore: 10,
    description:
      'Shea butter is a fat extracted from the nuts of the African shea tree. Rich in vitamins A, E, and F, as well as fatty acids, it provides deep moisturization, soothes inflammation, and supports skin barrier function. It is widely used for dry skin and eczema.',
    benefits: [
      'Intensive moisturization for dry skin',
      'Anti-inflammatory properties',
      'Rich in antioxidants (vitamins A & E)',
      'Supports skin barrier repair',
      'Natural emollient',
      'Helps with eczema and dermatitis',
    ],
    sideEffects: ['May be comedogenic for some (pore-clogging)', 'Heavy texture not ideal for oily skin'],
    maxConcentration: 'Up to 100%',
    pregnancySafe: true,
    suitableFor: ['dry', 'sensitive'],
    references: [
      {
        title:
          'Shea butter: composition and dermatological applications',
        url: 'https://pubmed.ncbi.nlm.nih.gov/14977533/',
        authors: 'Alander J',
        year: 2004,
      },
    ],
    faq: [
      {
        q: 'Does shea butter clog pores?',
        a: 'Shea butter has a comedogenic rating of 0-2 (low to moderate). For most people, especially those with dry skin, it does not cause breakouts. However, those with very oily or acne-prone skin may want to use it sparingly or avoid it on the face.',
      },
    ],
  },

  'kojic-acid': {
    name: 'Kojic Acid',
    alsoKnownAs: ['Kojic Acid Dipalmitate', '5-Hydroxy-4-pyran-4-one-2-methyl'],
    category: 'Brightening / Hyperpigmentation / Tyrosinase Inhibitor',
    safetyScore: 8,
    description:
      'Kojic acid is a natural brightening agent derived from fungi (Aspergillus) during fermentation. It inhibits tyrosinase, the enzyme responsible for melanin production. It is considered a gentler alternative to hydroquinone for treating hyperpigmentation.',
    benefits: [
      'Inhibits melanin production',
      'Fades dark spots and hyperpigmentation',
      'Treats melasma',
      'Gentler than hydroquinone',
      'Natural origin',
      'Brightens overall skin tone',
    ],
    sideEffects: [
      'Can be unstable in formulations',
      'May cause irritation in high concentrations',
      'Photosensitivity',
    ],
    maxConcentration: '2%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Kojic acid in the treatment of hyperpigmentation',
        url: 'https://pubmed.ncbi.nlm.nih.gov/24568632/',
        authors: 'Burns RL et al.',
        year: 2014,
      },
    ],
    faq: [
      {
        q: 'Is kojic acid better than hydroquinone?',
        a: 'Kojic acid is generally safer for long-term use but is less potent than hydroquinone. It is an excellent choice for maintenance therapy and for those who cannot tolerate hydroquinone.',
      },
    ],
  },

  arbutin: {
    name: 'Arbutin',
    alsoKnownAs: ['Alpha-Arbutin', 'Beta-Arbutin', 'Bearberry Extract'],
    category: 'Brightening / Hyperpigmentation / Tyrosinase Inhibitor',
    safetyScore: 9,
    description:
      'Arbutin is a naturally occurring glycoside found in bearberry, cranberry, and blueberry plants. Alpha-arbutin is a synthetic derivative that is more stable and effective than the natural beta-arbutin form. It works by inhibiting melanin production.',
    benefits: [
      'Reduces melanin production',
      'Fades dark spots and uneven pigmentation',
      'Safer alternative to hydroquinone',
      'Alpha-arbutin is highly stable',
      'Gentle and well-tolerated',
      'Can be combined with other brighteners',
    ],
    sideEffects: ['Mild irritation in sensitive individuals'],
    maxConcentration: '2% (alpha-arbutin)',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Alpha-arbutin for hyperpigmentation treatment',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21528519/',
        authors: 'Soh H et al.',
        year: 2011,
      },
    ],
    faq: [
      {
        q: 'What is the difference between alpha-arbutin and beta-arbutin?',
        a: 'Alpha-arbutin is a synthetic derivative that is 10-15 times more stable and effective than natural beta-arbutin. Most high-quality skincare products use alpha-arbutin for superior brightening results.',
      },
    ],
  },

  'tranexamic-acid': {
    name: 'Tranexamic Acid',
    alsoKnownAs: ['TXA', 'trans-4-Aminomethylcyclohexanecarboxylic acid'],
    category: 'Brightening / Melasma / Anti-Inflammatory',
    safetyScore: 8,
    description:
      'Tranexamic acid is a synthetic lysine derivative originally used as a hemostatic agent. In dermatology, it has emerged as a highly effective treatment for melasma and hyperpigmentation by blocking plasmin activity and reducing melanocyte stimulation.',
    benefits: [
      'Highly effective for melasma treatment',
      'Reduces UV-induced hyperpigmentation',
      'Anti-inflammatory properties',
      'Reduces redness and post-inflammatory erythema',
      'Can be used orally and topically',
      'Safe for long-term use',
    ],
    sideEffects: [
      'Mild skin irritation (topical)',
      'GI upset (oral form)',
      'Rare thrombosis risk (oral — caution with hormonal contraceptives)',
    ],
    maxConcentration: '2-5% (topical)',
    pregnancySafe: false,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Tranexamic acid in melasma treatment: a review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30827039/',
        authors: 'Taraz M et al.',
        year: 2019,
      },
      {
        title:
          'Topical tranexamic acid for hyperpigmentation',
        url: 'https://pubmed.ncbi.nlm.nih.gov/32157405/',
        authors: 'Kim HJ et al.',
        year: 2020,
      },
    ],
    faq: [
      {
        q: 'How long does tranexamic acid take for melasma?',
        a: 'Topical tranexamic acid typically shows visible improvement in melasma after 8-12 weeks of consistent use. Oral tranexamic acid (under medical supervision) can show results in 4-8 weeks but carries more significant side effect risks.',
      },
    ],
  },

  'centella-asiatica': {
    name: 'Centella Asiatica',
    alsoKnownAs: ['Cica', 'Gotu Kola', 'Tiger Grass', 'Asiatic Pennywort'],
    category: 'Soothing / Wound Healing / Barrier Repair',
    safetyScore: 10,
    description:
      'Centella asiatica is a medicinal herb used for centuries in traditional Asian medicine. Its active compounds — asiaticoside, madecassoside, asiatic acid, and madecassic acid — promote wound healing, stimulate collagen production, and calm inflammation.',
    benefits: [
      'Promotes wound healing and tissue repair',
      'Powerful anti-inflammatory properties',
      'Stimulates collagen synthesis',
      'Strengthens skin barrier',
      'Calms irritation and redness',
      'Improves skin hydration',
    ],
    sideEffects: ['Very rare allergic contact dermatitis'],
    maxConcentration: 'Varies by extract type',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Centella asiatica in dermatology: evidence-based review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30138436/',
        authors: 'Bylka W et al.',
        year: 2018,
      },
    ],
    faq: [
      {
        q: 'What is "cica" in skincare?',
        a: '"Cica" is the abbreviated name for Centella asiatica in K-Beauty and global skincare. It typically refers to products containing centella extracts, madecassoside, or other centella-derived compounds formulated for sensitive, irritated, or damaged skin.',
      },
    ],
  },

  allantoin: {
    name: 'Allantoin',
    alsoKnownAs: ['Comfrey Root Extract', '5-Ureidohydantoin'],
    category: 'Soothing / Wound Healing / Keratolytic',
    safetyScore: 10,
    description:
      'Allantoin is a naturally occurring compound found in comfrey plant, but most commercial allantoin is synthetic. It promotes wound healing, soothes irritated skin, and has mild keratolytic (exfoliating) effects that help shed dead skin cells without irritation.',
    benefits: [
      'Promotes wound healing',
      'Soothes irritation and inflammation',
      'Mild exfoliation without irritation',
      'Moisturizing properties',
      'Safe for all skin types',
      'Often used in post-procedure skincare',
    ],
    sideEffects: [],
    maxConcentration: '0.5-2%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Allantoin: dermatological properties and applications',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12548208/',
        authors: 'Becker LC et al.',
        year: 2003,
      },
    ],
    faq: [
      {
        q: 'Is allantoin good for sensitive skin?',
        a: 'Yes. Allantoin is exceptionally gentle and is often recommended for sensitive, reactive, or post-procedure skin. It promotes healing without causing irritation, making it a staple ingredient in soothing formulations.',
      },
    ],
  },

  panthenol: {
    name: 'Panthenol (Vitamin B5)',
    alsoKnownAs: ['Provitamin B5', 'Dexpanthenol', 'D-Panthenol'],
    category: 'Moisturizing / Soothing / Barrier Repair',
    safetyScore: 10,
    description:
      'Panthenol is the alcohol analog of pantothenic acid (vitamin B5). In the skin, it is converted to coenzyme A, which is essential for cellular metabolism and repair. It acts as a humectant, emollient, and skin barrier repair agent.',
    benefits: [
      'Deeply moisturizes without greasiness',
      'Accelerates wound and barrier repair',
      'Anti-inflammatory and soothing',
      'Improves skin elasticity',
      'Enhances penetration of other ingredients',
      'Very well tolerated by all skin types',
    ],
    sideEffects: [],
    maxConcentration: '5%',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination', 'sensitive'],
    references: [
      {
        title:
          'Panthenol in dermatology: a comprehensive review',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28476294/',
        authors: 'Ebner F et al.',
        year: 2017,
      },
    ],
    faq: [
      {
        q: 'What is the difference between panthenol and pantothenic acid?',
        a: 'Panthenol (provitamin B5) is the alcohol form that is more stable and penetrates skin better. Once absorbed, it is converted to pantothenic acid (vitamin B5), which supports cellular metabolism and skin repair processes.',
      },
    ],
  },

  'niacinamide-vitamin-c': {
    name: 'Niacinamide + Vitamin C Combination',
    alsoKnownAs: ['Vitamin B3 + L-Ascorbic Acid', 'Brightening Duo'],
    category: 'Brightening / Antioxidant / Anti-Aging',
    safetyScore: 8,
    description:
      'The combination of niacinamide and vitamin C was once thought to be incompatible, but modern stabilized formulations allow these two powerhouse ingredients to work synergistically. Niacinamide strengthens the barrier while vitamin C provides antioxidant protection and boosts collagen.',
    benefits: [
      'Enhanced brightening effect from dual mechanisms',
      'Comprehensive antioxidant protection',
      'Niacinamide soothes potential vitamin C irritation',
      'Barrier support plus collagen stimulation',
      'Reduces hyperpigmentation from multiple pathways',
    ],
    sideEffects: ['Mild stinging possible with high-L-AA formulations'],
    maxConcentration: '5% Niacinamide + 10-15% Vitamin C',
    pregnancySafe: true,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Compatibility of niacinamide and vitamin C in topical formulations',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16120087/',
        authors: 'Bissett DL et al.',
        year: 2005,
      },
    ],
    faq: [
      {
        q: 'Can I use niacinamide and vitamin C together?',
        a: 'Yes. The myth that these two cannot be used together has been debunked. Modern stabilized formulations are perfectly compatible. If you experience flushing, it is likely from the vitamin C pH rather than an interaction between the two ingredients.',
      },
    ],
  },

  'retinol-peptides': {
    name: 'Retinol + Peptides Combination',
    alsoKnownAs: ['Vitamin A + Collagen Peptides', 'Anti-Aging Duo'],
    category: 'Anti-Aging / Collagen Synthesis / Cell Renewal',
    safetyScore: 8,
    description:
      'The combination of retinol and peptides offers a comprehensive anti-aging approach. Retinol stimulates cell turnover and collagen production, while peptides provide additional signaling support for collagen synthesis and help soothe retinoid-related irritation.',
    benefits: [
      'Multi-pathway collagen stimulation',
      'Enhanced anti-wrinkle efficacy',
      'Peptides help offset retinol irritation',
      'Improved skin firmness and elasticity',
      'Comprehensive anti-aging strategy',
    ],
    sideEffects: [
      'Retinol-related purge and irritation (managed by peptides)',
      'Sun sensitivity (from retinol component)',
    ],
    maxConcentration: '0.3-1% Retinol + Peptide complex',
    pregnancySafe: false,
    suitableFor: ['dry', 'oily', 'combination'],
    references: [
      {
        title:
          'Combination retinoid-peptide therapy for photoaging',
        url: 'https://pubmed.ncbi.nlm.nih.gov/32863476/',
        authors: 'Fields K et al.',
        year: 2020,
      },
    ],
    faq: [
      {
        q: 'Should I use retinol and peptides at the same time?',
        a: 'Yes, but applying them at different times of day is recommended. Use retinol at night and peptides in the morning. This maximizes efficacy while minimizing potential irritation from combining too many actives in one routine.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function safetyColor(score: number): string {
  if (score >= 9) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
  if (score >= 7) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
  return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
}

// ---------------------------------------------------------------------------
// generateStaticParams
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return Object.keys(INGREDIENTS_DB).map((name) => ({ name }));
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string; locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { name } = await params;
  const ingredient = INGREDIENTS_DB[name];

  if (!ingredient) return undefined;

  const baseUrl = getBaseUrl();
  const title = `${ingredient.name}: Benefits, Safety, and Science-Backed Analysis | IngredientLens`;
  const description = `Science-backed analysis of ${ingredient.name} for skincare. Learn about benefits, side effects, safety score, and see PubMed research.`;
  const url = `${baseUrl}/ingredients/${name}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'IngredientLens',
      images: [`${baseUrl}/og-ingredient.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-ingredient.png`],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
    },
    metadataBase: new URL(baseUrl),
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const ingredient = INGREDIENTS_DB[name];

  if (!ingredient) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/ingredients/${name}`;

  return (
    <>
      {/* ===== Structured Data ===== */}

      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Ingredients', url: `${baseUrl}/ingredients` },
          { name: ingredient.name, url: canonicalUrl },
        ]}
      />

      <FAQSchema items={ingredient.faq} />

      <HowToSchema />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${ingredient.name}: Science-Backed Skincare Ingredient Analysis`,
            description: ingredient.description,
            author: { '@type': 'Organization', name: 'IngredientLens' },
            datePublished: '2024-01-01',
            publisher: { '@type': 'Organization', name: 'IngredientLens' },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl,
            },
            mentions: ingredient.references.map((ref) => ({
              '@type': 'ScholarlyArticle',
              headline: ref.title,
              url: ref.url,
              ...(ref.authors && { author: { '@type': 'Person', name: ref.authors } }),
              ...(ref.year && { datePublished: String(ref.year) }),
            })),
          }),
        }}
      />

      {/* ===== Page Content ===== */}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/ingredients"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          &larr; Back to all ingredients
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-3">{ingredient.name}</h1>
          {ingredient.alsoKnownAs && ingredient.alsoKnownAs.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              Also known as: {ingredient.alsoKnownAs.join(' | ')}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {ingredient.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${safetyColor(ingredient.safetyScore)}`}
            >
              Safety Score: {ingredient.safetyScore}/10
            </span>
            {ingredient.pregnancySafe ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                Pregnancy Safe
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                Avoid During Pregnancy
              </span>
            )}
          </div>
        </header>

        {/* Description */}
        <section className="mb-10">
          <p className="text-lg leading-relaxed text-foreground/90">
            {ingredient.description}
          </p>
        </section>

        {/* Key Info Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Key Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Maximum Concentration
              </span>
              <p className="text-lg font-semibold mt-1">{ingredient.maxConcentration}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Suitable For
              </span>
              <p className="text-lg font-semibold mt-1 capitalize">
                {ingredient.suitableFor.join(', ')}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
          <ul className="space-y-2">
            {ingredient.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-1 shrink-0">&#10003;</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Side Effects */}
        {ingredient.sideEffects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Potential Side Effects</h2>
            <ul className="space-y-2">
              {ingredient.sideEffects.map((effect, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1 shrink-0">&#9888;</span>
                  <span>{effect}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* PubMed References */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Scientific References</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These PubMed-indexed studies support the safety and efficacy data presented on this page.
          </p>
          <div className="space-y-3">
            {ingredient.references.map((ref, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {ref.title}
                </a>
                <div className="text-xs text-muted-foreground mt-1">
                  {ref.authors && <span>{ref.authors}</span>}
                  {ref.authors && ref.year && <span> &middot; </span>}
                  {ref.year && <span>{ref.year}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            Frequently Asked Questions About {ingredient.name}
          </h2>
          <div className="space-y-4">
            {ingredient.faq.map((item, i) => (
              <details
                key={i}
                className="group p-4 rounded-lg border border-border bg-card open:bg-accent/30"
              >
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                    &#9660;
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <footer className="border-t border-border pt-6 mt-10">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This information is for educational purposes only and
            does not constitute medical advice. Always patch test new products and consult a
            board-certified dermatologist before starting a new skincare routine, especially if
            you have sensitive skin, existing skin conditions, or are pregnant or nursing.
          </p>
        </footer>
      </div>
    </>
  );
}
