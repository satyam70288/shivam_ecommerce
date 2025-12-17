"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { TrendingUp } from "lucide-react";
import { Colors } from "@/constants/colors";

/* =========================
   MONTH MAP
========================= */
const monthMap = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
  5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
  9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

export function Chart1({ data }) {
  if (!data?.sixMonthsBarChartData?.length) {
    return (
      <Card className="flex-1 rounded-xl bg-muted/50 p-6">
        <p className="text-sm text-muted-foreground">
          No chart data available
        </p>
      </Card>
    );
  }

  /* =========================
     TRANSFORM BACKEND DATA
  ========================= */
  const chartData = Object.values(
    data.sixMonthsBarChartData.reduce((acc, item) => {
      const month = monthMap[item._id.month];
      const category = item._id.category;
      const count = item.count;

      if (!acc[month]) acc[month] = { month };
      acc[month][category] = count;

      return acc;
    }, {})
  );

  const categoryKeys = Object.keys(chartData[0]).filter(
    (key) => key !== "month"
  );

  return (
    <Card className="flex-1 rounded-xl bg-muted/50">
      <CardHeader>
        <CardTitle>Orders by Category</CardTitle>
        <CardDescription>
          Category-wise order quantity (last 6 months)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={chartData}
              barSize={28}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              {/* GRID */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.4}
              />

              {/* AXES */}
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              {/* TOOLTIP */}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="rounded-lg shadow-md"
                  />
                }
              />

              {/* LEGEND */}
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />

              {/* BARS (STACKED = BEAUTIFUL) */}
              {categoryKeys.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  fill={
                    Object.values(Colors)[
                      index % Object.values(Colors).length
                    ]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium">
          Trending up <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          Stacked view for better category comparison
        </div>
      </CardFooter>
    </Card>
  );
}
