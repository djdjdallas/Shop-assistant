import { getSupabaseServerClient } from '../supabase-server';
import { paginateGraphQL } from '../shopify-graphql';
import { GET_ORDERS_BY_DATE_RANGE, GetOrdersResponse, ShopifyOrder } from '../queries/orders';
import { subDays, format, parseISO, startOfDay } from 'date-fns';

interface DailySales {
  date: string;
  unitsSold: number;
  revenue: number;
}

interface AggregationResult {
  productId: string;
  daysProcessed: number;
  ordersProcessed: number;
  totalUnits: number;
  totalRevenue: number;
  dailySales: DailySales[];
  errors: string[];
}

/**
 * Aggregate sales data from Shopify orders into the sales_timeseries table.
 * Queries orders for the specified product and date range, then aggregates
 * units sold and revenue by day.
 */
export async function aggregateSalesData(
  shopDomain: string,
  shopId: string,
  productId: string,
  daysBack: number = 90
): Promise<AggregationResult> {
  const supabase = getSupabaseServerClient();
  const result: AggregationResult = {
    productId,
    daysProcessed: 0,
    ordersProcessed: 0,
    totalUnits: 0,
    totalRevenue: 0,
    dailySales: [],
    errors: [],
  };

  try {
    const endDate = new Date();
    const startDate = subDays(endDate, daysBack);

    // Build query for orders in date range
    const query = `created_at:>=${format(startDate, 'yyyy-MM-dd')} created_at:<=${format(endDate, 'yyyy-MM-dd')}`;

    // Fetch all orders in date range
    const orders = await paginateGraphQL<GetOrdersResponse, ShopifyOrder>(
      shopDomain,
      GET_ORDERS_BY_DATE_RANGE,
      { first: 100, query },
      (data) => data.orders.edges.map((edge) => edge.node),
      (data) => data.orders.pageInfo,
      50 // Max 5000 orders
    );

    result.ordersProcessed = orders.length;

    // Aggregate by day and product
    const dailyAggregates = new Map<string, { units: number; revenue: number }>();

    for (const order of orders) {
      // Skip non-paid orders
      if (order.displayFinancialStatus === 'VOIDED' || order.displayFinancialStatus === 'REFUNDED') {
        continue;
      }

      const orderDate = format(startOfDay(parseISO(order.createdAt)), 'yyyy-MM-dd');

      for (const lineItem of order.lineItems.edges) {
        const item = lineItem.node;

        // Check if this line item is for the product we're tracking
        if (item.product?.id !== productId) {
          continue;
        }

        const units = item.quantity;
        const unitPrice = parseFloat(item.originalUnitPriceSet.shopMoney.amount);
        const revenue = units * unitPrice;

        const existing = dailyAggregates.get(orderDate) || { units: 0, revenue: 0 };
        dailyAggregates.set(orderDate, {
          units: existing.units + units,
          revenue: existing.revenue + revenue,
        });

        result.totalUnits += units;
        result.totalRevenue += revenue;
      }
    }

    // Convert to array and sort by date
    result.dailySales = Array.from(dailyAggregates.entries())
      .map(([date, data]) => ({
        date,
        unitsSold: data.units,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    result.daysProcessed = result.dailySales.length;

    // Upsert to sales_timeseries table
    if (result.dailySales.length > 0) {
      const upsertData = result.dailySales.map((day) => ({
        shop_id: shopId,
        product_id: productId,
        date: day.date,
        units_sold: day.unitsSold,
        revenue: day.revenue,
      }));

      const { error } = await supabase
        .from('sales_timeseries')
        .upsert(upsertData, {
          onConflict: 'shop_id,product_id,date',
        });

      if (error) {
        result.errors.push(`Failed to save sales data: ${error.message}`);
      }
    }

    // Update product stats cache
    await updateStatsCache(supabase, shopId, productId, result.dailySales);

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
}

/**
 * Update the product_stats_cache table with aggregated stats.
 */
async function updateStatsCache(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  shopId: string,
  productId: string,
  dailySales: DailySales[]
): Promise<void> {
  const now = new Date();

  // Calculate 30-day stats
  const thirtyDaysAgo = subDays(now, 30);
  const last30Days = dailySales.filter(
    (day) => parseISO(day.date) >= thirtyDaysAgo
  );

  const stats30 = {
    units_sold: last30Days.reduce((sum, day) => sum + day.unitsSold, 0),
    revenue: last30Days.reduce((sum, day) => sum + day.revenue, 0),
    daily_breakdown: last30Days.map((day) => ({
      date: day.date,
      units: day.unitsSold,
      revenue: day.revenue,
    })),
  };

  // Calculate 90-day stats
  const ninetyDaysAgo = subDays(now, 90);
  const last90Days = dailySales.filter(
    (day) => parseISO(day.date) >= ninetyDaysAgo
  );

  const stats90 = {
    units_sold: last90Days.reduce((sum, day) => sum + day.unitsSold, 0),
    revenue: last90Days.reduce((sum, day) => sum + day.revenue, 0),
    daily_breakdown: last90Days.map((day) => ({
      date: day.date,
      units: day.unitsSold,
      revenue: day.revenue,
    })),
  };

  // Upsert 30-day stats
  await supabase.from('product_stats_cache').upsert({
    shop_id: shopId,
    product_id: productId,
    period: '30d',
    ...stats30,
    calculated_at: now.toISOString(),
  }, {
    onConflict: 'shop_id,product_id,period',
  });

  // Upsert 90-day stats
  await supabase.from('product_stats_cache').upsert({
    shop_id: shopId,
    product_id: productId,
    period: '90d',
    ...stats90,
    calculated_at: now.toISOString(),
  }, {
    onConflict: 'shop_id,product_id,period',
  });
}
