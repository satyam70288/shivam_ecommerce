"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  PERIODS,
  filterByPeriod,
  sumBreakdown,
  buildAllYears,
  getMonthLabel,
  periodGrowthPercent,
  DEFAULT_METRICS_START_YEAR,
} from "@/utils/analyticsPeriod";

const formatCurrency = (v) =>
  `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function RevenueDashboard({
  data,
  selectedYear,
  onYearChange,
  selectedPeriod = "full",
  onPeriodChange,
  availableYears = [],
  yearRange,
}) {
  const breakdown = data?.yearlyMonthlyBreakdown;
  const prevBreakdown = data?.prevYearMonthlyBreakdown;

  const years = useMemo(() => {
    const maxY = yearRange?.max ?? new Date().getFullYear();
    const minY = yearRange?.min ?? DEFAULT_METRICS_START_YEAR;
    return buildAllYears(minY, maxY);
  }, [yearRange]);

  const periodMeta = PERIODS[selectedPeriod] || PERIODS.full;

  const { chartData, stats } = useMemo(() => {
    if (!breakdown?.length) {
      return { chartData: [], stats: null };
    }

    const filtered = filterByPeriod(breakdown, selectedPeriod);
    const prevFiltered = filterByPeriod(prevBreakdown || [], selectedPeriod);

    const current = sumBreakdown(filtered);
    const previous = sumBreakdown(prevFiltered);

    const mapped = filtered.map((row, index) => {
      const prevRow = filtered[index - 1];
      const prevAmt = prevRow?.totalAmount || 0;
      const curr = Number(row.totalAmount);
      const growth =
        prevAmt > 0 ? Number((((curr - prevAmt) / prevAmt) * 100).toFixed(1)) : 0;

      return {
        month: getMonthLabel(row.month),
        monthNum: row.month,
        revenue: curr,
        orders: row.totalOrders,
        growth,
      };
    });

    const bestMonth = mapped.reduce(
      (best, cur) => (cur.revenue > best.revenue ? cur : best),
      mapped[0] || { month: "—", revenue: 0 }
    );

    const monthsWithSales = mapped.filter((d) => d.revenue > 0).length;
    const avgRevenue =
      monthsWithSales > 0 ? current.revenue / monthsWithSales : 0;

    return {
      chartData: mapped,
      stats: {
        totalRevenue: current.revenue,
        totalOrders: current.orders,
        yoyGrowth: periodGrowthPercent(current.revenue, previous.revenue),
        prevPeriodTotal: previous.revenue,
        avgMonthly:
          Math.round((current.revenue / filtered.length) * 100) / 100,
        bestMonth,
        avgRevenue,
        monthCount: filtered.length,
      },
    };
  }, [breakdown, prevBreakdown, selectedPeriod]);

  if (!breakdown?.length || !stats) return null;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Year-wise revenue
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedYear} · {periodMeta.shortLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-muted/40 p-0.5">
            {Object.values(PERIODS).map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant={selectedPeriod === p.id ? "default" : "ghost"}
                className="h-8 px-3 text-xs"
                onClick={() => onPeriodChange?.(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <Select
            value={String(selectedYear)}
            onValueChange={(y) => onYearChange?.(Number(y))}
          >
            <SelectTrigger className="w-[100px] bg-background">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              {selectedYear} · {periodMeta.label}
            </p>
            <p className="text-lg font-bold">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              vs {selectedYear - 1} ({periodMeta.shortLabel})
            </p>
            <p
              className={`text-lg font-bold ${
                stats.yoyGrowth >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {stats.yoyGrowth >= 0 ? "+" : ""}
              {stats.yoyGrowth.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              was {formatCurrency(stats.prevPeriodTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Best month</p>
            <p className="text-lg font-bold">
              {stats.bestMonth.month}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {formatCurrency(stats.bestMonth.revenue)}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Orders · avg / {stats.monthCount} mo
            </p>
            <p className="text-lg font-bold">
              {stats.totalOrders}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                · {formatCurrency(stats.avgMonthly)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl bg-muted/40 backdrop-blur">
        <CardHeader>
          <CardTitle>Revenue Intelligence</CardTitle>
          <CardDescription>
            {selectedYear} — {periodMeta.label} ({stats.monthCount} months)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ bottom: 8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.15}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#475569" }}
                interval={0}
              />

              <YAxis
                tickFormatter={(v) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
                }
                tick={{ fontSize: 12, fill: "#475569" }}
              />

              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                      <p className="font-semibold">
                        {d.month} {selectedYear}
                      </p>
                      <p>Revenue: {formatCurrency(d.revenue)}</p>
                      <p>Orders: {d.orders}</p>
                      {d.growth !== 0 && (
                        <p className="text-muted-foreground">
                          MoM: {d.growth > 0 ? "+" : ""}
                          {d.growth}%
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <defs>
                <linearGradient id="barNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="barSpike" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCA5A5" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>

              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={32}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.revenue > stats.avgRevenue * 1.8 && d.revenue > 0
                        ? "url(#barSpike)"
                        : d.revenue > 0
                          ? "url(#barNormal)"
                          : "#E2E8F0"
                    }
                  />
                ))}
              </Bar>

              {stats.avgRevenue > 0 && (
                <ReferenceLine
                  y={stats.avgRevenue}
                  stroke="#64748B"
                  strokeDasharray="4 4"
                  label={{
                    value: "Avg",
                    position: "right",
                    fill: "#64748B",
                    fontSize: 11,
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>

          <div
            className={`mt-4 grid gap-2 ${
              chartData.length <= 6
                ? "grid-cols-3 sm:grid-cols-6"
                : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12"
            }`}
          >
            {chartData.map((m) => (
              <div
                key={m.monthNum}
                className="rounded-md border bg-background/60 px-1.5 py-2 text-center"
              >
                <p className="text-[10px] font-medium text-muted-foreground">
                  {m.month}
                </p>
                <p className="text-xs font-semibold tabular-nums">
                  {m.revenue > 0
                    ? m.revenue >= 1000
                      ? `₹${(m.revenue / 1000).toFixed(1)}k`
                      : `₹${m.revenue}`
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
