"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import {
  PERIODS,
  filterByPeriod,
  getMonthLabel,
} from "@/utils/analyticsPeriod";

export default function LineSalesChart({
  data,
  selectedYear,
  selectedPeriod = "full",
}) {
  const breakdown = data?.yearlyMonthlyBreakdown;
  const periodMeta = PERIODS[selectedPeriod] || PERIODS.full;

  const chartData = useMemo(() => {
    if (!breakdown?.length) return [];
    return filterByPeriod(breakdown, selectedPeriod).map((row) => ({
      month: getMonthLabel(row.month),
      amount: Number(row.totalAmount),
      orders: Number(row.totalOrders),
      aov: Math.round(row.aov || 0),
    }));
  }, [breakdown, selectedPeriod]);

  if (!chartData.length) return null;

  return (
    <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
        <CardDescription className="text-sm">
          {selectedYear} · {periodMeta.label} — revenue, orders & AOV
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.25} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.25}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              interval={0}
            />

            <YAxis
              yAxisId="revenue"
              tickFormatter={(v) =>
                v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
              }
              domain={[0, (dataMax) => Math.max(dataMax * 1.25, 100)]}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              yAxisId="orders"
              orientation="right"
              domain={[0, (dataMax) => Math.ceil(Math.max(dataMax * 1.4, 1))]}
              tickLine={false}
              axisLine={false}
            />

            <YAxis yAxisId="aov" hide />

            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                borderRadius: 8,
                border: "none",
                color: "#fff",
                fontSize: 13,
              }}
              formatter={(value, name) => {
                if (name === "Revenue")
                  return [`₹${Number(value).toLocaleString()}`, name];
                if (name === "Orders") return [value, name];
                if (name === "AOV") return [`₹${value}`, name];
                return value;
              }}
              labelFormatter={(label) => `${label} ${selectedYear}`}
            />

            <Legend />

            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="amount"
              stroke="url(#revenueGradient)"
              strokeWidth={3.5}
              dot={{ r: 4, fill: "#10B981" }}
              activeDot={{ r: 7, fill: "#10B981" }}
              name="Revenue"
            />

            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#0EA5E9"
              strokeWidth={2.8}
              dot={{ r: 3, fill: "#0EA5E9" }}
              activeDot={{ r: 6, fill: "#0EA5E9" }}
              name="Orders"
            />

            <Line
              yAxisId="aov"
              type="monotone"
              dataKey="aov"
              stroke="#8B5CF6"
              strokeWidth={2.2}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: "#8B5CF6" }}
              activeDot={{ r: 6, fill: "#8B5CF6" }}
              name="AOV"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
