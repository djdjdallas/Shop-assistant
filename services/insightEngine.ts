import { ProductStats, Competitor } from '../types';

export interface Insight {
  key: string;
  text: string;
  tags: string[];
  severity: 'info' | 'warning' | 'critical';
}

interface InsightInput {
  stats: ProductStats | null;
  inventory: number;
  competitors: Competitor[];
  period: '30d' | '90d';
  productPrice?: string;
}

export function generateInsights({
  stats,
  inventory,
  competitors,
  period,
  productPrice,
}: InsightInput): Insight[] {
  const insights: Insight[] = [];

  if (!stats || stats.daily_breakdown.length === 0) {
    return insights;
  }

  const daysInPeriod = period === '30d' ? 30 : 90;
  const dailyVelocity = stats.units_sold / daysInPeriod;

  // --- Low stock / Stock warning ---
  if (dailyVelocity > 0) {
    const daysRemaining = inventory / dailyVelocity;

    if (daysRemaining < 7) {
      insights.push({
        key: 'low-stock',
        text: `Low stock alert: At current sales velocity (~${dailyVelocity.toFixed(1)} units/day), inventory will run out in ~${Math.round(daysRemaining)} days. Consider reordering immediately.`,
        tags: ['inventory', 'alert'],
        severity: 'critical',
      });
    } else if (daysRemaining < 21) {
      insights.push({
        key: 'stock-warning',
        text: `Stock warning: ~${Math.round(daysRemaining)} days of inventory remaining at current sales rate. Plan a reorder soon.`,
        tags: ['inventory', 'warning'],
        severity: 'warning',
      });
    }
  }

  // --- Revenue trending up / down (compare last 7d avg vs previous 7d avg) ---
  const breakdown = stats.daily_breakdown;
  if (breakdown.length >= 14) {
    const last7 = breakdown.slice(-7);
    const prev7 = breakdown.slice(-14, -7);

    const last7Avg = last7.reduce((sum, d) => sum + d.revenue, 0) / 7;
    const prev7Avg = prev7.reduce((sum, d) => sum + d.revenue, 0) / 7;

    if (prev7Avg > 0) {
      const changePercent = ((last7Avg - prev7Avg) / prev7Avg) * 100;

      if (changePercent >= 15) {
        insights.push({
          key: 'revenue-up',
          text: `Revenue trending up: Last 7-day average ($${last7Avg.toFixed(0)}/day) is ${changePercent.toFixed(0)}% higher than the previous week. Momentum looks strong!`,
          tags: ['revenue', 'trend'],
          severity: 'info',
        });
      } else if (changePercent <= -15) {
        insights.push({
          key: 'revenue-down',
          text: `Revenue trending down: Last 7-day average ($${last7Avg.toFixed(0)}/day) is ${Math.abs(changePercent).toFixed(0)}% lower than the previous week. Consider running a promotion.`,
          tags: ['revenue', 'trend'],
          severity: 'warning',
        });
      }
    }
  }

  // --- Sales spike (any of last 3 days > 2x period average) ---
  if (breakdown.length >= 3) {
    const periodAvgRevenue = breakdown.reduce((sum, d) => sum + d.revenue, 0) / breakdown.length;
    const last3 = breakdown.slice(-3);
    const spikeDay = last3.find(d => d.revenue > 2 * periodAvgRevenue);

    if (spikeDay && periodAvgRevenue > 0) {
      insights.push({
        key: 'sales-spike',
        text: `Sales spike detected: ${new Date(spikeDay.date).toLocaleDateString()} had $${spikeDay.revenue.toFixed(0)} in revenue — more than 2x your daily average of $${periodAvgRevenue.toFixed(0)}.`,
        tags: ['sales', 'spike'],
        severity: 'info',
      });
    }
  }

  // --- Competitor undercut ---
  if (productPrice && competitors.length > 0) {
    const myPrice = parseFloat(productPrice);
    if (!isNaN(myPrice) && myPrice > 0) {
      const undercutters = competitors.filter(c => {
        const cPrice = parseFloat(c.price);
        return !isNaN(cPrice) && cPrice < myPrice;
      });

      if (undercutters.length > 0) {
        const cheapest = undercutters.reduce((min, c) => {
          const p = parseFloat(c.price);
          return p < parseFloat(min.price) ? c : min;
        });
        insights.push({
          key: 'competitor-undercut',
          text: `Competitor undercut: ${cheapest.name} is listing at $${parseFloat(cheapest.price).toFixed(2)}, which is below your price of $${myPrice.toFixed(2)}. Review your pricing strategy.`,
          tags: ['competitor', 'pricing'],
          severity: 'warning',
        });
      }
    }
  }

  return insights;
}
