export type SeriesPoint = { date: string; value: number };
export type ForecastPoint = { date: string; expectedUnits: number; lowerBound: number; upperBound: number };

export function computeCorrelation(salesData: SeriesPoint[], trendsData: SeriesPoint[]): number {
  const aligned = alignSeries(salesData, trendsData);
  if (aligned.length < 2) return 0;

  const xs = aligned.map(pair => pair[0]);
  const ys = aligned.map(pair => pair[1]);
  const meanX = average(xs);
  const meanY = average(ys);

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < aligned.length; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return num / den;
}

export function findOptimalLag(
  salesData: SeriesPoint[],
  trendsData: SeriesPoint[],
  maxLag = 8
): { lag: number; correlation: number } {
  let bestLag = 0;
  let bestCorrelation = -Infinity;

  for (let lag = 0; lag <= maxLag; lag += 1) {
    const shiftedTrends = trendsData.map(point => ({
      date: shiftDate(point.date, lag * 7),
      value: point.value,
    }));
    const correlation = computeCorrelation(salesData, shiftedTrends);
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  return { lag: bestLag, correlation: bestCorrelation };
}

export function detectSeasonality(trendsData: SeriesPoint[]): {
  hasSeasonality: boolean;
  peaks: number[];
  pattern: 'monthly' | 'quarterly' | 'annual' | 'none';
} {
  if (trendsData.length < 12) {
    return { hasSeasonality: false, peaks: [], pattern: 'none' };
  }

  const monthlyBuckets = new Map<number, number[]>();
  for (const point of trendsData) {
    const month = new Date(point.date).getMonth();
    const bucket = monthlyBuckets.get(month) ?? [];
    bucket.push(point.value);
    monthlyBuckets.set(month, bucket);
  }

  const monthlyAverages = Array.from(monthlyBuckets.entries()).map(([month, values]) => ({
    month,
    average: average(values),
  }));

  const sorted = [...monthlyAverages].sort((a, b) => b.average - a.average);
  const peaks = sorted.slice(0, 2).map(item => item.month);

  const hasSeasonality = sorted[0].average - sorted[sorted.length - 1].average > 10;
  return {
    hasSeasonality,
    peaks,
    pattern: hasSeasonality ? 'annual' : 'none',
  };
}

export function generateForecast(
  salesHistory: SeriesPoint[],
  trendsHistory: SeriesPoint[],
  horizonDays: number
): ForecastPoint[] {
  const base = salesHistory.map(point => point.value);
  const lastValue = base[base.length - 1] ?? 0;
  const trend = trendsHistory.map(point => point.value);
  const trendMean = trend.length ? average(trend) : 0;

  const alpha = 0.4;
  let level = lastValue;

  const forecast: ForecastPoint[] = [];
  for (let i = 1; i <= horizonDays; i += 1) {
    const trendBoost = trendMean ? (trendMean / 100) * 0.1 * lastValue : 0;
    level = alpha * level + (1 - alpha) * lastValue;
    const expected = Math.max(0, level + trendBoost);
    forecast.push({
      date: shiftDate(new Date().toISOString(), i),
      expectedUnits: round(expected),
      lowerBound: round(expected * 0.8),
      upperBound: round(expected * 1.2),
    });
  }

  return forecast;
}

const alignSeries = (sales: SeriesPoint[], trends: SeriesPoint[]) => {
  const trendMap = new Map(trends.map(point => [point.date, point.value]));
  return sales
    .filter(point => trendMap.has(point.date))
    .map(point => [point.value, trendMap.get(point.date) as number]);
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const round = (value: number) => Math.round(value * 100) / 100;

const shiftDate = (iso: string, days: number) => {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};
