const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface IngredientAnalysis {
  overall_score: number
  overall_assessment: string
  ingredients: Array<{
    name: string
    function: string
    safety_score: number
    irritant_level: string
    comedogenic_level: string
    pregnancy_safe: boolean
    suitable_skin_types: string[]
    description: string
    references: Array<{ title: string; url: string }>
  }>
  warnings: Array<{ type: string; ingredient: string; detail: string }>
}

export async function analyzeIngredients(
  ingredients: string[],
  productName?: string
): Promise<IngredientAnalysis> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://ingredientlens.com',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: `You are a cosmetic ingredient analysis expert and dermatologist.
Analyze the provided INCI ingredient list and return ONLY valid JSON (no markdown, no code blocks).

Output format:
{
  "overall_score": 85,
  "overall_assessment": "Short summary...",
  "ingredients": [
    {
      "name": "Ingredient name",
      "function": "Function category",
      "safety_score": 1-10,
      "irritant_level": "low|medium|high",
      "comedogenic_level": "low|medium|high",
      "pregnancy_safe": true/false,
      "suitable_skin_types": ["dry","oily","combination","normal","sensitive"],
      "description": "Evidence-based description",
      "references": [{"title": "Study title", "url": "https://pubmed.ncbi.nlm.nih.gov/XXXXX/"}]
    }
  ],
  "warnings": [{"type": "allergen|irritant|pregnancy", "ingredient": "name", "detail": "explanation"}]
}

Rules:
- Every ingredient MUST have >=1 PubMed reference
- Base safety scores on published clinical evidence
- If uncertain, mark safety_score as 5 and note "limited evidence" in description
- Be thorough with warnings - flag common allergens, known irritants, pregnancy-unsafe ingredients`
        },
        {
          role: 'user',
          content: `Product: ${productName || 'Unknown'}\nIngredients: ${ingredients.join(', ')}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content)
}

export async function ocrImage(imageBase64: string): Promise<string[]> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all INCI ingredient names from this cosmetic product label. Return them as a comma-separated list. Only return the ingredient names, nothing else.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.choices[0].message.content
  return text.split(',').map(i => i.trim()).filter(Boolean)
}
