import { NextResponse } from 'next/server';
import { getAuthenticatedShop } from '../../../../lib/session';
import { getSupabaseServerClient, resolveShopId } from '../../../../lib/supabase-server';
import { generateForecast, SeriesPoint, ForecastPoint } from '../../../../lib/forecasting';

interface GenerateForecastRequest {
  productId: string;
  horizonDays?: number;
}

/**
 * Generate forecasts from sales + trends data and store results.
 */
export async function POST(request: Request) {
  const body: GenerateForecastRequest = await request.json();

  const authenticatedShop = await getAuthenticatedShop(request);
  const shopId = authenticatedShop?.id || resolveShopId(request, body as { shopId?: string });

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, horizonDays = 30 } = body;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  try {
    // Fetch sales timeseries data
    const { data: salesData, error: salesError } = await supabase
      .from('sales_timeseries')
      .select('date, units_sold, revenue')
      .eq('shop_id', shopId)
      .eq('product_id', productId)
      .order('date', { ascending: true });

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    // Get trend mappings for this product
    const { data: mappings } = await supabase
      .from('product_trends_mappings')
      .select('trends_query_id')
      .eq('product_id', productId);

    // Fetch trends timeseries data if mappings exist
    let trendsData: SeriesPoint[] = [];

    if (mappings && mappings.length > 0) {
      const queryIds = mappings.map(m => m.trends_query_id);

      const { data: trendsRaw } = await supabase
        .from('trends_timeseries')
        .select('date, interest_value')
        .in('trends_query_id', queryIds)
        .order('date', { ascending: true });

      if (trendsRaw && trendsRaw.length > 0) {
        // Average trends values by date if multiple queries
        const trendsMap = new Map<string, number[]>();
        for (const point of trendsRaw) {
          const existing = trendsMap.get(point.date) || [];
          existing.push(point.interest_value);
          trendsMap.set(point.date, existing);
        }

        trendsData = Array.from(trendsMap.entries()).map(([date, values]) => ({
          date,
          value: values.reduce((a, b) => a + b, 0) / values.length,
        }));
      }
    }

    // Convert sales data to SeriesPoint format
    const salesHistory: SeriesPoint[] = (salesData || []).map(row => ({
      date: row.date,
      value: row.units_sold,
    }));

    if (salesHistory.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No sales data available for forecasting. Run sales aggregation first.',
      }, { status: 400 });
    }

    // Generate forecast
    const forecast: ForecastPoint[] = generateForecast(
      salesHistory,
      trendsData,
      horizonDays
    );

    // Store forecast results
    const forecastRecords = forecast.map(point => ({
      shop_id: shopId,
      product_id: productId,
      forecast_date: point.date,
      predicted_units: point.expectedUnits,
      predicted_revenue: point.expectedUnits * (salesData![0]?.revenue / salesData![0]?.units_sold || 0),
      confidence_lower: point.lowerBound,
      confidence_upper: point.upperBound,
      created_at: new Date().toISOString(),
    }));

    // Delete old forecasts for this product
    await supabase
      .from('forecasts')
      .delete()
      .eq('shop_id', shopId)
      .eq('product_id', productId);

    // Insert new forecasts
    const { error: insertError } = await supabase
      .from('forecasts')
      .insert(forecastRecords);

    if (insertError) {
      console.error('Failed to store forecast:', insertError);
      return NextResponse.json({ error: 'Failed to store forecast' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      productId,
      horizonDays,
      forecastPoints: forecast.length,
      dateRange: {
        start: forecast[0].date,
        end: forecast[forecast.length - 1].date,
      },
      summary: {
        totalPredictedUnits: forecast.reduce((sum, p) => sum + p.expectedUnits, 0),
        averageDailyUnits: Math.round(
          forecast.reduce((sum, p) => sum + p.expectedUnits, 0) / forecast.length * 100
        ) / 100,
      },
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
