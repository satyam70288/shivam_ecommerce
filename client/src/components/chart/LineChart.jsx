"use client";

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

/* =========================
   MONTH MAP
========================= */
const monthMap = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export default function LineSalesChart({ data }) {
  if (!data?.monthlySalesTrend?.length) return null;

  /* =========================
     BACKEND → CHART FORMAT
  ========================= */
  const chartData = data.monthlySalesTrend.map((item) => ({
    month: monthMap[item._id.month],
    amount: Number(item.totalAmount),
    orders: Number(item.totalOrders),
    aov: Math.round(item.aov),
  }));

  return (
    <Card className="flex-1 rounded-2xl bg-muted/40 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
        <CardDescription className="text-sm">
          Revenue, Orders & AOV (last 6 months)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            {/* ===== Gradient (BRIGHT) ===== */}
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

            <XAxis dataKey="month" tickLine={false} axisLine={false} />

            {/* ===== Revenue Axis (₹) ===== */}
            <YAxis
              yAxisId="revenue"
              tickFormatter={(v) =>
                v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
              }
              domain={[0, (dataMax) => dataMax * 1.25]}
              tickLine={false}
              axisLine={false}
            />

            {/* ===== Orders Axis ===== */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.4)]}
              tickLine={false}
              axisLine={false}
            />

            {/* ===== AOV Axis (hidden) ===== */}
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
                  return [`₹${value.toLocaleString()}`, name];
                if (name === "Orders") return [value, name];
                if (name === "AOV") return [`₹${value}`, name];
                return value;
              }}
            />

            <Legend />

            {/* ===== Revenue (BRIGHT HERO) ===== */}
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="amount"
              stroke="url(#revenueGradient)"
              strokeWidth={3.5}
              dot={{
                r: 4,
                fill: "#10B981",
              }}
              activeDot={{
                r: 7,
                fill: "#10B981",
              }}
              name="Revenue"
            />

            {/* ===== Orders (BRIGHT SUPPORT) ===== */}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#0EA5E9" // brighter blue
              strokeWidth={2.8}
              dot={{
                r: 3,
                fill: "#0EA5E9",
              }}
              activeDot={{
                r: 6,
                fill: "#0EA5E9",
              }}
              name="Orders"
            />

            {/* ===== AOV (SUBTLE BUT VISIBLE) ===== */}
            <Line
              yAxisId="aov"
              type="monotone"
              dataKey="aov"
              stroke="#8B5CF6" // brighter violet
              strokeWidth={2.2}
              strokeDasharray="6 4"
              dot={{
                r: 3,
                fill: "#8B5CF6",
              }}
              activeDot={{
                r: 6,
                fill: "#8B5CF6",
              }}
              name="AOV"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
