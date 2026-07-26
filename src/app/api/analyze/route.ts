import { NextRequest, NextResponse } from 'next/server'
import { analyzeIngredients, ocrImage } from '@/ai/openrouter'
import { requireSession, unauthorizedResponse } from '@/lib/require-session'

/**
 * 从成分名搜索本地缓存或 CosIng 增强数据
 * 实际部署中，这会调 Python 后端的 CosIng 服务
 */
async function enhanceWithCosIng(ingredients: string[]) {
  // 对于 MVP 阶段，CosIng 数据由 Python 后端异步导入
  // 这里返回空增强（数据在后续异步处理时补充）
  return {
    enhanced: false,
    note: 'CosIng enhancement runs async via data pipeline',
    timestamp: new Date().toISOString()
  }
}

/**
 * INCI 名称标准化（本地轻量版）
 * 完整版在 Python backend/services/ingredient_normalizer.py
 */
function normalizeIngredientList(raw: string[]): string[] {
  const aliasMap: Record<string, string> = {
    'aqua': 'Water', 'eau': 'Water', '水': 'Water', '纯净水': 'Water',
    '甘油': 'Glycerin', 'glycerol': 'Glycerin', '丙三醇': 'Glycerin',
    '烟酰胺': 'Niacinamide', 'nicotinamide': 'Niacinamide', 'vitamin b3': 'Niacinamide',
    '透明质酸钠': 'Sodium Hyaluronate', '玻尿酸': 'Sodium Hyaluronate',
    '视黄醇': 'Retinol', 'a醇': 'Retinol', '维生素a': 'Retinol',
    '维生素c': 'Ascorbic Acid', 'vc': 'Ascorbic Acid', '抗坏血酸': 'Ascorbic Acid',
    '维生素e': 'Tocopherol', 've': 'Tocopherol', '生育酚': 'Tocopherol',
    '角鲨烷': 'Squalane',
    '泛醇': 'Panthenol', 'b5': 'Panthenol', '维生素b5': 'Panthenol',
    '水杨酸': 'Salicylic Acid', 'bha': 'Salicylic Acid',
    '果酸': 'Glycolic Acid', 'aha': 'Glycolic Acid',
    '神经酰胺': 'Ceramide',
    '辅酶q10': 'Ubiquinone', 'coq10': 'Ubiquinone',
    '积雪草': 'Centella Asiatica', '积雪草苷': 'Centella Asiatica',
    '虾青素': 'Astaxanthin',
    '白藜芦醇': 'Resveratrol',
    '熊果苷': 'Arbutin',
    '曲酸': 'Kojic Acid',
    '壬二酸': 'Azelaic Acid',
    '传明酸': 'Tranexamic Acid',
    '依克多因': 'Ectoin',
    '苯氧乙醇': 'Phenoxyethanol',
    '香精': 'Parfum', 'fragrance': 'Parfum',
    '乙醇': 'Alcohol', '酒精': 'Alcohol',
  }

  return raw.map(item => {
    const cleaned = item.trim().replace(/^\d+[\.\)、]\s*/, '').replace(/\(.*?\)/g, '').replace(/\d+%/g, '').trim().toLowerCase()
    return aliasMap[cleaned] || item.trim()
  }).filter(Boolean)
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request)
  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    const { image, ingredients, productName } = body

    let ingredientList: string[]

    if (image) {
      ingredientList = await ocrImage(image)
    } else if (ingredients && Array.isArray(ingredients)) {
      ingredientList = ingredients
    } else {
      return NextResponse.json(
        { error: 'Provide either image or ingredients array' },
        { status: 400 }
      )
    }

    // Step 1: INCI 标准化
    const normalizedIngredients = normalizeIngredientList(ingredientList)

    // Step 2: AI 分析
    const analysis = await analyzeIngredients(normalizedIngredients, productName)

    // Step 3: CosIng 增强（离线数据，不影响响应速度）
    const cosingEnhancement = await enhanceWithCosIng(normalizedIngredients)
    
    // 为每个成分标注数据来源
    if (analysis?.ingredients) {
      analysis.ingredients = analysis.ingredients.map((ing: any) => ({
        ...ing,
        data_source: 'AI + PubMed',
        source_confidence: ing.references?.length > 0 ? 'high' : 'medium'
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        productName: productName || 'Unknown Product',
        ingredients: normalizedIngredients,
        analysis,
        enrichment: cosingEnhancement
      }
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
