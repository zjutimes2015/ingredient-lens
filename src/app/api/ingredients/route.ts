import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ingredients } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';

/**
 * GET /api/ingredients?q=xxx
 *
 * Query the ingredients encyclopedia. Returns matching ingredients
 * by INCI name, Chinese name, or function category.
 *
 * Examples:
 *   /api/ingredients?q=hyaluronic
 *   /api/ingredients?q=保湿
 *   /api/ingredients?q=&limit=50   (list all, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '20', 10) || 20, 1), 50);

    const db = await getDb();

    let rows;
    if (query) {
      // Search across INCI name, Chinese name, and function category
      const pattern = `%${query}%`;
      rows = await db
        .select()
        .from(ingredients)
        .where(
          or(
            ilike(ingredients.inciName, pattern),
            ilike(ingredients.chineseName, pattern),
            ilike(ingredients.functionCategory, pattern),
          ),
        )
        .orderBy(ingredients.inciName)
        .limit(limit);
    } else {
      // List all with limit
      rows = await db
        .select()
        .from(ingredients)
        .orderBy(ingredients.inciName)
        .limit(limit);
    }

    return NextResponse.json({
      success: true,
      data: rows,
      meta: {
        query,
        count: rows.length,
        limit,
      },
    });
  } catch (error) {
    console.error('Ingredients API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to query ingredients',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
