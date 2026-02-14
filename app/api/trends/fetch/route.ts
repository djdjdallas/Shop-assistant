import { NextResponse } from 'next/server';
import { getAuthenticatedShop } from '../../../../lib/session';
import { getSupabaseServerClient } from '../../../../lib/supabase-server';
import { fetchTrendsData, TrendsPoint } from '../../../../services/google-trends';
import { subDays } from 'date-fns';

interface FetchTrendsRequest {
  queryId?: string;
  queryText?: string;
  daysBack?: number;
  region?: string;
}

/**
 * Fetch Google Trends data for a query and store it in the database.
 */
export async function POST(request: Request) {
  const authenticatedShop = await getAuthenticatedShop(request);

  if (!authenticatedShop) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: FetchTrendsRequest = await request.json();
    const { queryId, queryText, daysBack = 90, region = 'US' } = body;

    if (!queryId && !queryText) {
      return NextResponse.json(
        { error: 'Either queryId or queryText is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    let trendsQueryId = queryId;
    let searchQuery = queryText;

    // If queryId provided, look up the query text
    if (queryId) {
      const { data: existingQuery, error } = await supabase
        .from('google_trends_queries')
        .select('id, query')
        .eq('id', queryId)
        .eq('shop_id', authenticatedShop.id)
        .single();

      if (error || !existingQuery) {
        return NextResponse.json({ error: 'Query not found' }, { status: 404 });
      }

      searchQuery = existingQuery.query;
    } else if (queryText) {
      // Create new query record if it doesn't exist
      const { data: existingQuery } = await supabase
        .from('google_trends_queries')
        .select('id')
        .eq('shop_id', authenticatedShop.id)
        .eq('query', queryText)
        .single();

      if (existingQuery) {
        trendsQueryId = existingQuery.id;
      } else {
        const { data: newQuery, error: insertError } = await supabase
          .from('google_trends_queries')
          .insert({
            shop_id: authenticatedShop.id,
            query: queryText,
          })
          .select('id')
          .single();

        if (insertError || !newQuery) {
          return NextResponse.json(
            { error: 'Failed to create query record' },
            { status: 500 }
          );
        }

        trendsQueryId = newQuery.id;
      }
    }

    // Fetch trends data from Google
    const endDate = new Date();
    const startDate = subDays(endDate, daysBack);

    const trendsData = await fetchTrendsData(
      searchQuery!,
      region,
      startDate,
      endDate
    );

    if (trendsData.length === 0) {
      return NextResponse.json({
        success: true,
        queryId: trendsQueryId,
        dataPoints: 0,
        timeseries: [],
        message: 'No data returned from Google Trends. The query may have no search volume or the API may be rate limited.',
      });
    }

    // Store trends data in database
    const upsertData = trendsData.map((point: TrendsPoint) => ({
      trends_query_id: trendsQueryId,
      date: point.date,
      interest_value: point.index_value,
    }));

    const { error: upsertError } = await supabase
      .from('trends_timeseries')
      .upsert(upsertData, {
        onConflict: 'trends_query_id,date',
      });

    if (upsertError) {
      console.error('Failed to store trends data:', upsertError);
      return NextResponse.json(
        { error: 'Failed to store trends data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queryId: trendsQueryId,
      dataPoints: trendsData.length,
      timeseries: trendsData.map((p: TrendsPoint) => ({
        date: p.date,
        interest: p.index_value,
      })),
      dateRange: {
        start: trendsData[0].date,
        end: trendsData[trendsData.length - 1].date,
      },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
