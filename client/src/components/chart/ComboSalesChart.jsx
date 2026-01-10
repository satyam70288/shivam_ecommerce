"use client";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

/* =========================
   MONTH MAP
========================= */
const monthMap = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
  5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
  9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

export default function RevenueDashboard({ data }) {
  if (!data?.monthlySalesTrend?.length) return null;

  const raw = data.monthlySalesTrend;

  /* =========================
     BASE DATA
  ========================= */
  const chartData = raw.map((item, index) => {
    const prev = raw[index - 1]?.totalAmount || 0;
    const curr = Number(item.totalAmount);

    const growth = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;

    return {
      month: `${monthMap[item._id.month]} ${item._id.year}`,
      revenue: curr,
      growth,
    };
  });

  /* =========================
     KPI CALCULATIONS
  ========================= */
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);

  const first = chartData[0].revenue;
  const last = chartData.at(-1).revenue;

  const overallGrowth = first > 0 ? Number((((last - first) / first) * 100).toFixed(1)) : 0;

  const bestMonth = chartData.reduce(
    (best, cur) => (cur.revenue > best.revenue ? cur : best),
    chartData[0]
  );

  const lastMoMGrowth = chartData.at(-1)?.growth ?? 0;

  /* =========================
     FORECAST (NEXT MONTH)
  ========================= */
  const lastThree = chartData.slice(-3);
  const deltas = lastThree.map((d, i) =>
    i === 0 ? 0 : d.revenue - lastThree[i - 1].revenue
  );
  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;

  const forecastValue = Math.round(last + avgDelta);

  const forecastData = [
    ...chartData,
    {
      month: "Forecast",
      revenue: forecastValue,
      forecast: forecastValue,
    },
  ];

  /* =========================
     ANOMALY DETECTION
  ========================= */
  const avgRevenue = totalRevenue / chartData.length;

  return (
    <>
      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4">💰 Total<br />₹{totalRevenue.toLocaleString()}</CardContent></Card>
        <Card><CardContent className="p-4">📈 Overall<br />{overallGrowth}%</CardContent></Card>
        <Card><CardContent className="p-4">⭐ Best Month<br />₹{bestMonth.revenue.toLocaleString()}</CardContent></Card>
        <Card><CardContent className="p-4">⚡ Last MoM<br />{lastMoMGrowth}%</CardContent></Card>
      </div>

      {/* ================= CHART ================= */}
      <Card className="rounded-2xl bg-muted/40 backdrop-blur">
        <CardHeader>
          <CardTitle>Revenue Intelligence</CardTitle>
          <CardDescription>
            Actuals, forecast & anomaly detection
          </CardDescription>
        </CardHeader>

       <CardContent>
  <ResponsiveContainer width="100%" height={360}>
    <BarChart data={forecastData}>
      {/* ===== Grid ===== */}
      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12, fill: "#475569" }}
      />

      <YAxis
        tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
        tick={{ fontSize: 12, fill: "#475569" }}
      />

      <Tooltip
        cursor={{ fill: "rgba(99,102,241,0.08)" }}
        formatter={(v, n) =>
          n === "revenue"
            ? [`₹${v.toLocaleString()}`, "Revenue"]
            : [`₹${v.toLocaleString()}`, "Forecast"]
        }
      />

      {/* ===== Gradients ===== */}
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

      {/* ===== Revenue Bars ===== */}
      <Bar
        dataKey="revenue"
        radius={[10, 10, 0, 0]}
        barSize={36}
      >
        {forecastData.map((d, i) => (
          <Cell
            key={i}
            fill={
              d.revenue > avgRevenue * 1.8
                ? "url(#barSpike)"
                : "url(#barNormal)"
            }
          />
        ))}
      </Bar>

      {/* ===== Forecast Line ===== */}
      <Line
        type="monotone"
        dataKey="forecast"
        stroke="#6366F1"
        strokeWidth={3}
        strokeDasharray="6 6"
        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
        activeDot={{ r: 6 }}
      />

      {/* ===== Average Line ===== */}
      <ReferenceLine
        y={avgRevenue}
        stroke="#64748B"
        strokeDasharray="4 4"
        label={{
          value: "Avg",
          position: "right",
          fill: "#64748B",
          fontSize: 12
        }}
      />
    </BarChart>
  </ResponsiveContainer>
</CardContent>

      </Card>
    </>
  );
}
