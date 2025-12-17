"use client";

import {
  PieChart,
  Pie,
  Cell,
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
import { Colors } from "@/constants/colors";

/* =========================
   CATEGORY → COLOR MAP
========================= */
const CATEGORY_COLORS = {
  Cosmetics: Colors.customYellow,
  "Imitation Jewellery": Colors.customPink,
  "Pooja Essentials": Colors.customGreen,
  Bags: Colors.customBlue,
  Toys: Colors.customPurple,
  Gifts: Colors.customPink,
  Stationery: Colors.customGreen,
};

export default function CategoryPieChart({ data }) {
  if (!data?.sixMonthsBarChartData?.length) return null;

  /* =========================
     AGGREGATE CATEGORY DATA
  ========================= */
  const categoryMap = {};

  data.sixMonthsBarChartData.forEach((item) => {
    const category = item._id.category;
    categoryMap[category] =
      (categoryMap[category] || 0) + item.count;
  });

  const pieData = Object.entries(categoryMap).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <Card className="bg-muted/60 rounded-xl">
      <CardHeader>
        <CardTitle>Category Contribution</CardTitle>
        <CardDescription>Share by category</CardDescription>
      </CardHeader>

      <CardContent>
  <div className="flex flex-col md:flex-row items-center gap-6">

    {/* ===== PIE ===== */}
    <div className="w-full md:w-[55%] h-[260px] md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
          >
            {pieData.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  CATEGORY_COLORS[entry.name] ||
                  Colors.customGray
                }
              />
            ))}
          </Pie>

          <Tooltip formatter={(value, name) => [value, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* ===== LEGEND ===== */}
    <div className="w-full md:w-[45%] flex flex-col gap-3">
      {pieData.map((item) => {
        const total = pieData.reduce(
          (s, d) => s + d.value,
          0
        );
        const percent = (
          (item.value / total) *
          100
        ).toFixed(1);

        return (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm shrink-0"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[item.name] ||
                    Colors.customGray,
                }}
              />
              <span className="text-sm font-medium truncate">
                {item.name}
              </span>
            </div>

            <span className="text-sm text-muted-foreground">
              {percent}%
            </span>
          </div>
        );
      })}
    </div>
  </div>
</CardContent>

    </Card>
  );
}
