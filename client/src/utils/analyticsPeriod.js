export const PERIODS = {
  full: {
    id: "full",
    label: "Full year",
    shortLabel: "Jan – Dec",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  h1: {
    id: "h1",
    label: "Jan – Jun",
    shortLabel: "H1",
    months: [1, 2, 3, 4, 5, 6],
  },
  h2: {
    id: "h2",
    label: "Jul – Dec",
    shortLabel: "H2",
    months: [7, 8, 9, 10, 11, 12],
  },
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getMonthLabel = (monthNum) => MONTH_LABELS[monthNum - 1] || "";

export function filterByPeriod(breakdown = [], periodId = "full") {
  const months = PERIODS[periodId]?.months ?? PERIODS.full.months;
  return breakdown.filter((row) => months.includes(row.month));
}

export function sumBreakdown(breakdown = []) {
  return breakdown.reduce(
    (acc, row) => ({
      revenue: acc.revenue + (row.totalAmount || 0),
      orders: acc.orders + (row.totalOrders || 0),
    }),
    { revenue: 0, orders: 0 }
  );
}

export const DEFAULT_METRICS_START_YEAR = 2020;

/** All calendar years from min → max (newest first) */
export function buildAllYears(minYear, maxYear) {
  const min = Number(minYear);
  const max = Number(maxYear);
  if (!min || !max || min > max) return [max || new Date().getFullYear()];

  const years = [];
  for (let y = max; y >= min; y--) years.push(y);
  return years;
}

export function periodGrowthPercent(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
