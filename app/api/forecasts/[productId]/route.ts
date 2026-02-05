import { NextResponse } from 'next/server';
import { getAuthenticatedShop } from '../../../../lib/session';
import { getSupabaseServerClient, resolveShopId } from '../../../../lib/supabase-server';

/**
 * GET: Return the latest forecast for a product
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request);

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Get the most recent forecast batch (all forecasts with the same created_at)
  const { data: latestForecast, error } = await supabase
    .from('forecasts')
    .select('*')
    .eq('shop_id', shopId)
    .eq('product_id', productId)
    .order('forecast_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!latestForecast || latestForecast.length === 0) {
    return NextResponse.json(
      { error: 'No forecast found for this product' },
      { status: 404 }
    );
  }

  // Group by created_at to find the most recent batch
  const createdAtGroups = new Map<string, typeof latestForecast>();
  for (const forecast of latestForecast) {
    const key = forecast.created_at;
    const group = createdAtGroups.get(key) || [];
    group.push(forecast);
    createdAtGroups.set(key, group);
  }

  // Get the most recent batch
  const sortedKeys = Array.from(createdAtGroups.keys()).sort().reverse();
  const mostRecentBatch = createdAtGroups.get(sortedKeys[0]) || [];

  // Format the response
  const forecastPoints = mostRecentBatch.map(f => ({
    date: f.forecast_date,
    predictedUnits: f.predicted_units,
    predictedRevenue: f.predicted_revenue,
    confidenceLower: f.confidence_lower,
    confidenceUpper: f.confidence_upper,
  }));

  return NextResponse.json({
    productId,
    createdAt: mostRecentBatch[0]?.created_at,
    horizonDays: forecastPoints.length,
    dateRange: {
      start: forecastPoints[0]?.date,
      end: forecastPoints[forecastPoints.length - 1]?.date,
    },
    summary: {
      totalPredictedUnits: forecastPoints.reduce((sum, p) => sum + p.predictedUnits, 0),
      totalPredictedRevenue: forecastPoints.reduce((sum, p) => sum + p.predictedRevenue, 0),
      averageDailyUnits: Math.round(
        forecastPoints.reduce((sum, p) => sum + p.predictedUnits, 0) / forecastPoints.length * 100
      ) / 100,
    },
    forecast: forecastPoints,
  });
}
