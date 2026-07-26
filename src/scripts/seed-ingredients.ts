/**
 * Seed script: populate the ingredients encyclopedia table
 *
 * Usage: tsx scripts/seed-ingredients.ts
 *
 * Inserts 50+ common cosmetic ingredients into the `ingredients` table.
 * Safe to re-run — uses ON CONFLICT DO NOTHING on unique inci_name.
 */
import dotenv from 'dotenv';
import { getDb } from '../src/db/index.js';
import { ingredients } from '../src/db/schema.js';
dotenv.config();

const SEED_DATA = [
  // ===== Hydrators & Humectants =====
  {
    inciName: 'Glycerin',
    chineseName: '甘油',
    functionCategory: 'Humectant',
    safetyScore: 89,
    description:
      'A natural humectant that draws moisture into the skin. One of the most common and well-studied skincare ingredients. Suitable for all skin types.',
    references: [{ title: 'Glycerin in cosmetics: a review', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=glycerin+skin+moisturizer', year: 2020 }],
  },
  {
    inciName: 'Sodium Hyaluronate',
    chineseName: '透明质酸钠',
    functionCategory: 'Humectant',
    safetyScore: 92,
    description:
      'A salt form of hyaluronic acid that holds up to 1000x its weight in water. Deeply hydrates and plumps the skin. Well-tolerated by sensitive skin.',
    references: [{ title: 'Hyaluronic acid in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=sodium+hyaluronate+skin', year: 2021 }],
  },
  {
    inciName: 'Hyaluronic Acid',
    chineseName: '透明质酸',
    functionCategory: 'Humectant',
    safetyScore: 93,
    description:
      'A powerful humectant naturally found in the skin. Attracts and retains moisture, reducing fine lines and dehydration. Backed by thousands of studies.',
    references: [{ title: 'Hyaluronic acid: a key molecule in skin aging', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=hyaluronic+acid+skin', year: 2022 }],
  },
  {
    inciName: 'Panthenol',
    chineseName: '泛醇（维生素B5）',
    functionCategory: 'Humectant / Soothing',
    safetyScore: 90,
    description:
      'Provitamin B5 that moisturizes, soothes, and supports skin barrier repair. Anti-inflammatory and well-suited for sensitive or compromised skin.',
    references: [{ title: 'Panthenol in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=panthenol+skin', year: 2019 }],
  },
  {
    inciName: 'Butylene Glycol',
    chineseName: '丁二醇',
    functionCategory: 'Humectant / Solvent',
    safetyScore: 75,
    description:
      'A common humectant and solvent that helps other ingredients penetrate the skin. Generally safe but can cause irritation in very sensitive skin.',
    references: [{ title: 'Safety assessment of butylene glycol', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=butylene+glycol+skin', year: 2018 }],
  },
  {
    inciName: 'Propylene Glycol',
    chineseName: '丙二醇',
    functionCategory: 'Humectant / Solvent',
    safetyScore: 62,
    description:
      'A penetration enhancer and humectant. Can cause irritation and contact dermatitis in sensitive individuals. Safer alternatives (glycerin, butylene glycol) are often preferred.',
    references: [{ title: 'Propylene glycol dermatitis', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=propylene+glycol+dermatitis', year: 2017 }],
  },
  {
    inciName: 'Snail Secretion Filtrate',
    chineseName: '蜗牛分泌滤液',
    functionCategory: 'Humectant / Healing',
    safetyScore: 78,
    description:
      'Snail mucin filtrate containing glycoproteins, hyaluronic acid, and glycolic acid. Promotes hydration, collagen production, and wound healing. Popular in K-beauty.',
    references: [{ title: 'Snail mucin in skincare', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=snail+secretion+filtrate', year: 2021 }],
  },
  {
    inciName: 'Betaine',
    chineseName: '甜菜碱',
    functionCategory: 'Humectant',
    safetyScore: 88,
    description:
      'A natural amino acid derivative that hydrates and protects the skin barrier. Mild, non-irritating, and suitable for sensitive skin.',
    references: [{ title: 'Betaine in cosmetic formulations', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=betaine+skin+moisturizer', year: 2020 }],
  },

  // ===== Emollients & Oils =====
  {
    inciName: 'Squalane',
    chineseName: '角鲨烷',
    functionCategory: 'Emollient',
    safetyScore: 91,
    description:
      'A lightweight, non-comedogenic oil that mimics the skin\'s natural sebum. Excellent moisturizer for all skin types including acne-prone. Derived from olives or sugarcane.',
    references: [{ title: 'Squalane in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=squalane+skin+moisturizer', year: 2020 }],
  },
  {
    inciName: 'Caprylic/Capric Triglyceride',
    chineseName: '辛酸/癸酸甘油三酯',
    functionCategory: 'Emollient',
    safetyScore: 88,
    description:
      'A lightweight fatty ester derived from coconut oil and glycerin. Non-greasy emollient that spreads easily. Generally non-comedogenic and well-tolerated.',
    references: [{ title: 'CCT in cosmetic formulations', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=caprylic+capric+triglyceride+skin', year: 2019 }],
  },
  {
    inciName: 'Dimethicone',
    chineseName: '聚二甲基硅氧烷',
    functionCategory: 'Silicone / Emollient',
    safetyScore: 85,
    description:
      'A silicone-based polymer that creates a smooth, protective barrier on the skin. Non-comedogenic and generally safe. Can cause congestion in some individuals.',
    references: [{ title: 'Safety of silicones in cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=dimethicone+safety+cosmetics', year: 2022 }],
  },
  {
    inciName: 'Cyclopentasiloxane',
    chineseName: '环五聚二甲基硅氧烷',
    functionCategory: 'Silicone / Emollient',
    safetyScore: 70,
    description:
      'A volatile silicone that evaporates on contact, leaving a silky finish. Under environmental scrutiny for persistence. Alternatives being developed.',
    references: [{ title: 'Cyclosiloxanes in cosmetics: environmental concerns', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=cyclopentasiloxane+environmental', year: 2021 }],
  },
  {
    inciName: 'Cetearyl Alcohol',
    chineseName: '鲸蜡硬脂醇',
    functionCategory: 'Emollient / Emulsifier',
    safetyScore: 86,
    description:
      'A fatty alcohol used as an emollient and emulsion stabilizer. Despite the name, it is non-drying and actually moisturizing. Safe for most skin types.',
    references: [{ title: 'Fatty alcohols in cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=cetearyl+alcohol+cosmetics', year: 2018 }],
  },
  {
    inciName: 'Shea Butter',
    chineseName: '乳木果油',
    functionCategory: 'Emollient',
    safetyScore: 90,
    description:
      'A nutrient-rich fat extracted from shea tree nuts. Rich in vitamins A, E, and fatty acids. Deeply moisturizing and anti-inflammatory.',
    references: [{ title: 'Shea butter in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=shea+butter+skin', year: 2019 }],
  },

  // ===== Antioxidants =====
  {
    inciName: 'Tocopherol',
    chineseName: '生育酚（维生素E）',
    functionCategory: 'Antioxidant',
    safetyScore: 92,
    description:
      'Vitamin E — a powerful antioxidant that protects against free radical damage and environmental stressors. Also acts as a natural preservative.',
    references: [{ title: 'Vitamin E in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=tocopherol+skin+antioxidant', year: 2021 }],
  },
  {
    inciName: 'Ascorbic Acid',
    chineseName: '抗坏血酸（维生素C）',
    functionCategory: 'Antioxidant / Brightening',
    safetyScore: 82,
    description:
      'Pure vitamin C — a potent antioxidant that brightens skin, boosts collagen, and protects against photoaging. pH-dependent stability; best formulated at low pH.',
    references: [{ title: 'Vitamin C in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ascorbic+acid+skin+brightening', year: 2022 }],
  },
  {
    inciName: 'Ascorbyl Glucoside',
    chineseName: '抗坏血酸葡糖苷',
    functionCategory: 'Antioxidant / Brightening',
    safetyScore: 88,
    description:
      'A stabilized vitamin C derivative that converts to ascorbic acid on the skin. Gentler and more stable than pure vitamin C, suitable for sensitive skin.',
    references: [{ title: 'Vitamin C derivatives in cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ascorbyl+glucoside+vitamin+c', year: 2020 }],
  },
  {
    inciName: 'Niacinamide',
    chineseName: '烟酰胺（维生素B3）',
    functionCategory: 'Antioxidant / Barrier Support',
    safetyScore: 93,
    description:
      'Vitamin B3 — a multi-tasking ingredient that strengthens the skin barrier, reduces pore appearance, fades hyperpigmentation, and regulates oil production.',
    references: [{ title: 'Niacinamide in dermatology: a review', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=niacinamide+skin+barrier', year: 2022 }],
  },
  {
    inciName: 'Resveratrol',
    chineseName: '白藜芦醇',
    functionCategory: 'Antioxidant',
    safetyScore: 85,
    description:
      'A polyphenol antioxidant found in grapes and berries. Protects against environmental damage and supports skin longevity. Best combined with other antioxidants.',
    references: [{ title: 'Resveratrol for skin aging', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=resveratrol+skin+aging', year: 2021 }],
  },
  {
    inciName: 'Ferulic Acid',
    chineseName: '阿魏酸',
    functionCategory: 'Antioxidant',
    safetyScore: 88,
    description:
      'A plant-based antioxidant that stabilizes and boosts the effectiveness of vitamins C and E. Often found in serums targeting photodamage and aging.',
    references: [{ title: 'Ferulic acid in photoprotection', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ferulic+acid+skin+photoprotection', year: 2020 }],
  },
  {
    inciName: 'Green Tea Extract',
    chineseName: '绿茶提取物',
    functionCategory: 'Antioxidant / Soothing',
    safetyScore: 86,
    description:
      'Polyphenol-rich extract with potent antioxidant and anti-inflammatory properties. Protects against UV damage and calms irritated skin.',
    references: [{ title: 'Green tea polyphenols in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=green+tea+extract+skin', year: 2021 }],
  },
  {
    inciName: 'Ubiquinone',
    chineseName: '泛醌（辅酶Q10）',
    functionCategory: 'Antioxidant',
    safetyScore: 84,
    description:
      'Coenzyme Q10 — a naturally occurring antioxidant that declines with age. Helps energize skin cells and reduce fine lines. Best in leave-on formulations.',
    references: [{ title: 'Coenzyme Q10 in cosmetology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ubiquinone+coenzyme+q10+skin', year: 2020 }],
  },

  // ===== Exfoliants & Actives =====
  {
    inciName: 'Glycolic Acid',
    chineseName: '乙醇酸',
    functionCategory: 'AHA Exfoliant',
    safetyScore: 72,
    description:
      'An alpha-hydroxy acid that exfoliates the skin surface, improving texture, tone, and fine lines. Can cause stinging and photosensitivity. Use sunscreen diligently.',
    references: [{ title: 'Glycolic acid peels in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=glycolic+acid+skin+exfoliation', year: 2022 }],
  },
  {
    inciName: 'Lactic Acid',
    chineseName: '乳酸',
    functionCategory: 'AHA Exfoliant',
    safetyScore: 80,
    description:
      'A gentler alpha-hydroxy acid that exfoliates while also hydrating. Naturally found in milk. Suitable for dry and sensitive skin types at lower concentrations.',
    references: [{ title: 'Lactic acid in skincare', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=lactic+acid+skin+moisturizer', year: 2021 }],
  },
  {
    inciName: 'Salicylic Acid',
    chineseName: '水杨酸',
    functionCategory: 'BHA Exfoliant',
    safetyScore: 74,
    description:
      'A beta-hydroxy acid that penetrates oil-filled pores to exfoliate from within. Excellent for acne-prone and oily skin. Not recommended during pregnancy.',
    references: [{ title: 'Salicylic acid in acne treatment', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=salicylic+acid+acne', year: 2022 }],
  },
  {
    inciName: 'Azelaic Acid',
    chineseName: '壬二酸',
    functionCategory: 'Anti-acne / Brightening',
    safetyScore: 85,
    description:
      'A naturally occurring acid that reduces acne, rosacea redness, and hyperpigmentation. Anti-inflammatory and safe during pregnancy.',
    references: [{ title: 'Azelaic acid: a review', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=azelaic+acid+rosacea+acne', year: 2021 }],
  },
  {
    inciName: 'Retinol',
    chineseName: '视黄醇（维生素A）',
    functionCategory: 'Retinoid / Anti-aging',
    safetyScore: 70,
    description:
      'Vitamin A derivative that accelerates cell turnover and boosts collagen production. Gold standard for anti-aging. Can cause irritation, peeling, and photosensitivity.',
    references: [{ title: 'Retinol in anti-aging therapy', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=retinol+skin+aging+collagen', year: 2023 }],
  },
  {
    inciName: 'Retinyl Palmitate',
    chineseName: '视黄醇棕榈酸酯',
    functionCategory: 'Retinoid / Anti-aging',
    safetyScore: 78,
    description:
      'A milder, ester form of vitamin A. Converts to retinol on skin surface. Less potent but better tolerated than pure retinol, especially for sensitive skin.',
    references: [{ title: 'Retinyl palmitate safety', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=retinyl+palmitate+skin+safety', year: 2020 }],
  },
  {
    inciName: 'Bakuchiol',
    chineseName: '补骨脂酚',
    functionCategory: 'Anti-aging / Retinol Alternative',
    safetyScore: 88,
    description:
      'A plant-derived retinol alternative that stimulates collagen without the irritation. Suitable for sensitive skin and pregnancy-safe. Often combined with other actives.',
    references: [{ title: 'Bakuchiol vs retinol: a clinical comparison', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=bakuchiol+retinol+comparison', year: 2022 }],
  },
  {
    inciName: 'Kojic Acid',
    chineseName: '曲酸',
    functionCategory: 'Brightening Agent',
    safetyScore: 78,
    description:
      'A natural brightening agent derived from fungi. Inhibits tyrosinase to reduce melanin production. Effective for hyperpigmentation and melasma.',
    references: [{ title: 'Kojic acid in hyperpigmentation treatment', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=kojic+acid+skin+brightening', year: 2019 }],
  },
  {
    inciName: 'Tranexamic Acid',
    chineseName: '传明酸',
    functionCategory: 'Brightening / Anti-inflammatory',
    safetyScore: 86,
    description:
      'A synthetic amino acid that reduces pigmentation by blocking plasmin activity. Gentle yet effective for melasma and post-inflammatory hyperpigmentation.',
    references: [{ title: 'Tranexamic acid for melasma', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=tranexamic+acid+melasma+skin', year: 2022 }],
  },

  // ===== Soothing & Barrier =====
  {
    inciName: 'Ceramide NP',
    chineseName: '神经酰胺NP',
    functionCategory: 'Barrier Repair',
    safetyScore: 95,
    description:
      'A lipid molecule that fills gaps in the skin barrier. Essential for maintaining hydration and protecting against irritants. Especially beneficial for dry and compromised skin.',
    references: [{ title: 'Ceramides in skin barrier function', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ceramide+skin+barrier', year: 2021 }],
  },
  {
    inciName: 'Madecassoside',
    chineseName: '积雪草苷',
    functionCategory: 'Soothing / Healing',
    safetyScore: 92,
    description:
      'A key active compound from Centella asiatica. Accelerates wound healing, reduces inflammation, and supports collagen synthesis. Excellent for sensitive skin.',
    references: [{ title: 'Madecassoside in wound healing', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=madecassoside+skin+healing', year: 2020 }],
  },
  {
    inciName: 'Centella Asiatica Extract',
    chineseName: '积雪草提取物',
    functionCategory: 'Soothing / Healing',
    safetyScore: 90,
    description:
      'A traditional herbal extract known for its anti-inflammatory and wound-healing properties. Soothes irritation and supports skin barrier recovery.',
    references: [{ title: 'Centella asiatica in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=centella+asiatica+skin', year: 2021 }],
  },
  {
    inciName: 'Allantoin',
    chineseName: '尿囊素',
    functionCategory: 'Soothing / Healing',
    safetyScore: 94,
    description:
      'A gentle soothing agent that promotes wound healing and softens the skin. Extremely well-tolerated. Commonly used in diaper rash and sensitive skin formulations.',
    references: [{ title: 'Allantoin in dermatological products', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=allantoin+skin+healing', year: 2018 }],
  },
  {
    inciName: 'Beta-Glucan',
    chineseName: 'β-葡聚糖',
    functionCategory: 'Soothing / Moisturizer',
    safetyScore: 90,
    description:
      'A polysaccharide derived from oats or yeast. Forms a protective film that soothes irritation and boosts immune defense. Excellent for sensitive and reactive skin.',
    references: [{ title: 'Beta-glucan in skincare', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=beta+glucan+skin+immunity', year: 2020 }],
  },
  {
    inciName: 'Zinc Oxide',
    chineseName: '氧化锌',
    functionCategory: 'Mineral Sunscreen / Soothing',
    safetyScore: 96,
    description:
      'A mineral UV filter that provides broad-spectrum protection. Also has anti-inflammatory and soothing properties. Safe for sensitive skin and reef-friendly.',
    references: [{ title: 'Zinc oxide in sunscreens', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=zinc+oxide+sunscreen+safety', year: 2022 }],
  },

  // ===== Preservatives & Fragrance =====
  {
    inciName: 'Phenoxyethanol',
    chineseName: '苯氧乙醇',
    functionCategory: 'Preservative',
    safetyScore: 75,
    description:
      'A common preservative used to prevent microbial growth. Generally safe at concentrations up to 1%. Less irritating than parabens for most users.',
    references: [{ title: 'Safety of phenoxyethanol in cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=phenoxyethanol+safety+cosmetics', year: 2019 }],
  },
  {
    inciName: 'Ethylhexylglycerin',
    chineseName: '乙基己基甘油',
    functionCategory: 'Preservative Booster',
    safetyScore: 82,
    description:
      'A mild preservative booster that also acts as a skin conditioner. Often paired with phenoxyethanol. Generally well-tolerated and low irritation risk.',
    references: [{ title: 'Ethylhexylglycerin in cosmetic preservation', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ethylhexylglycerin+cosmetics', year: 2020 }],
  },
  {
    inciName: 'Parfum / Fragrance',
    chineseName: '香精',
    functionCategory: 'Fragrance',
    safetyScore: 48,
    description:
      'A generic term for fragrance ingredients. One of the most common contact allergens. Fragrance-free formulations recommended for sensitive or reactive skin.',
    references: [{ title: 'Fragrance allergy in cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=fragrance+allergy+cosmetics', year: 2022 }],
  },
  {
    inciName: 'Limonene',
    chineseName: '柠檬烯',
    functionCategory: 'Fragrance Component',
    safetyScore: 55,
    description:
      'A natural terpene found in citrus oils. Used for scent but can oxidize into sensitizing compounds. Listed as a common allergen in EU regulations.',
    references: [{ title: 'Limonene oxidation and skin sensitization', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=limonene+skin+sensitization', year: 2019 }],
  },
  {
    inciName: 'Linalool',
    chineseName: '芳樟醇',
    functionCategory: 'Fragrance Component',
    safetyScore: 58,
    description:
      'A naturally occurring terpene found in many flowers and spices. Used in fragrances but can cause allergic reactions upon oxidation. EU-labeled allergen.',
    references: [{ title: 'Linalool in cosmetic products', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=linalool+contact+allergy', year: 2020 }],
  },

  // ===== More common ingredients =====
  {
    inciName: 'Caffeine',
    chineseName: '咖啡因',
    functionCategory: 'Antioxidant / Stimulant',
    safetyScore: 82,
    description:
      'A vasoconstrictor and antioxidant used in eye creams to reduce puffiness. Also helps protect against UV-induced damage. Well-absorbed topically.',
    references: [{ title: 'Caffeine in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=caffeine+topical+skin', year: 2021 }],
  },
  {
    inciName: 'Aloe Barbadensis Leaf Juice',
    chineseName: '库拉索芦荟叶汁',
    functionCategory: 'Soothing / Moisturizer',
    safetyScore: 91,
    description:
      'Aloe vera juice with anti-inflammatory and hydrating properties. Soothes sunburn and irritation. Contains vitamins, minerals, and amino acids.',
    references: [{ title: 'Aloe vera in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=aloe+vera+skin+soothing', year: 2020 }],
  },
  {
    inciName: 'Urea',
    chineseName: '尿素',
    functionCategory: 'Humectant / Exfoliant',
    safetyScore: 86,
    description:
      'A natural moisturizing factor that hydrates and gently exfoliates. Effective for dry, rough skin conditions like keratosis pilaris and eczema.',
    references: [{ title: 'Urea in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=urea+skin+moisturizer+exfoliant', year: 2019 }],
  },
  {
    inciName: 'Collagen',
    chineseName: '胶原蛋白',
    functionCategory: 'Moisturizer / Film Former',
    safetyScore: 70,
    description:
      'A structural protein included in many formulations. Topical collagen acts as a humectant film-former but does not directly increase skin collagen. Hydrolyzed forms may have limited peptide benefits.',
    references: [{ title: 'Topical collagen in cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=topical+collagen+skin', year: 2021 }],
  },
  {
    inciName: 'Arbutin',
    chineseName: '熊果苷',
    functionCategory: 'Brightening Agent',
    safetyScore: 84,
    description:
      'A natural glycosylated hydroquinone derived from bearberry. Gently inhibits melanin production with lower risk of side effects than hydroquinone.',
    references: [{ title: 'Arbutin in skin lightening', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=arbutin+skin+brightening+safety', year: 2020 }],
  },
  {
    inciName: 'Peptides (Generic)',
    chineseName: '多肽',
    functionCategory: 'Anti-aging / Signaling',
    safetyScore: 85,
    description:
      'Short amino acid chains that signal skin cells to produce more collagen and elastin. Well-tolerated and backed by growing clinical evidence.',
    references: [{ title: 'Peptides in anti-aging cosmetics', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=peptides+skin+anti+aging+signaling', year: 2022 }],
  },
  {
    inciName: 'Mandelic Acid',
    chineseName: '扁桃酸',
    functionCategory: 'AHA Exfoliant',
    safetyScore: 82,
    description:
      'A larger-molecule alpha-hydroxy acid with gentle exfoliation. Oil-soluble, making it effective for oily and acne-prone skin. Lower irritation than glycolic acid.',
    references: [{ title: 'Mandelic acid in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=mandelic+acid+skin+exfoliation', year: 2021 }],
  },
  {
    inciName: 'Sodium PCA',
    chineseName: '吡咯烷酮羧酸钠',
    functionCategory: 'Humectant',
    safetyScore: 90,
    description:
      'A natural component of the skin\'s NMF (Natural Moisturizing Factor). Excellent humectant that helps maintain optimal skin hydration levels. Non-irritating.',
    references: [{ title: 'Natural moisturizing factor components', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=sodium+pca+natural+moisturizing+factor', year: 2019 }],
  },
  {
    inciName: 'Titanium Dioxide',
    chineseName: '二氧化钛',
    functionCategory: 'Mineral Sunscreen',
    safetyScore: 94,
    description:
      'A mineral UV filter providing broad-spectrum protection. Non-irritating, non-comedogenic, and reef-safe. May leave a white cast on darker skin tones.',
    references: [{ title: 'Titanium dioxide in sunscreens', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=titanium+dioxide+sunscreen+safety', year: 2022 }],
  },
  {
    inciName: 'Alcohol Denat.',
    chineseName: '变性乙醇',
    functionCategory: 'Solvent / Astringent',
    safetyScore: 42,
    description:
      'Denatured alcohol used as a solvent and quick-drying agent. Can strip the skin barrier, cause irritation, and worsen dryness. Low concentrations may be acceptable in well-formulated products.',
    references: [{ title: 'Alcohol in skincare: friend or foe?', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=alcohol+denat+skin+barrier+damage', year: 2021 }],
  },
  {
    inciName: 'Coconut Oil',
    chineseName: '椰子油',
    functionCategory: 'Emollient',
    safetyScore: 65,
    description:
      'A natural oil rich in fatty acids. Highly moisturizing but highly comedogenic (rated 4/5). Can clog pores and cause breakouts in acne-prone individuals.',
    references: [{ title: 'Coconut oil in dermatology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=coconut+oil+skin+moisturizer+comedogenic', year: 2020 }],
  },
  {
    inciName: 'Jojoba Oil',
    chineseName: '霍霍巴油',
    functionCategory: 'Emollient',
    safetyScore: 88,
    description:
      'A liquid wax ester chemically similar to human sebum. Non-comedogenic, moisturizing, and balancing for all skin types including oily and acne-prone.',
    references: [{ title: 'Jojoba oil for acne-prone skin', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=jojoba+oil+skin+acne', year: 2019 }],
  },
];

async function seedIngredients() {
  const db = await getDb();

  console.log(`Seeding ${SEED_DATA.length} ingredients...`);

  // Batch insert with conflict handling
  for (const ingredient of SEED_DATA) {
    try {
      await db
        .insert(ingredients)
        .values({
          inciName: ingredient.inciName,
          chineseName: ingredient.chineseName,
          functionCategory: ingredient.functionCategory,
          safetyScore: ingredient.safetyScore,
          description: ingredient.description,
          references: JSON.stringify(ingredient.references),
        })
        .onConflictDoNothing();
      console.log(`  \u2713 ${ingredient.inciName}`);
    } catch (err) {
      console.error(`  \u2717 ${ingredient.inciName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  console.log(`\nSeeding complete. Total attempted: ${SEED_DATA.length}`);
}

seedIngredients();
