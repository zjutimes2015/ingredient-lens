import { NextRequest, NextResponse } from 'next/server'
import { analyzeIngredients, ocrImage } from '@/ai/openrouter'
import { requireSession, unauthorizedResponse } from '@/lib/require-session'

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

    const analysis = await analyzeIngredients(ingredientList, productName)

    return NextResponse.json({
      success: true,
      data: {
        productName: productName || 'Unknown Product',
        ingredients: ingredientList,
        analysis,
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
