import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { SidebarInset } from "../ui/sidebar";
import { Avatar, AvatarFallback } from "../ui/avatar";

import useErrorLogout from "@/hooks/use-error-logout";

import LineSalesChart from "../chart/LineChart";
import CategoryPieChart from "../chart/PieChart";
import ComboSalesChart from "../chart/ComboSalesChart";

/* ======================
   HELPERS
====================== */
const formatPercent = (value = 0) => {
  const num = Number(value);
  return {
    text: `${num > 0 ? "+" : ""}${num.toFixed(1)}%`,
    color:
      num > 0
        ? "text-emerald-500"
        : num < 0
        ? "text-rose-500"
        : "text-muted-foreground",
    Icon: num >= 0 ? ArrowUpRight : ArrowDownRight,
  };
};

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const { handleErrorLogout } = useErrorLogout();

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-metrics`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setMetrics(res.data.data);
      } catch (error) {
        handleErrorLogout(error);
      }
    };

    getMetrics();
  }, []);

  if (!metrics) return null;

  const salesGrowth = formatPercent(metrics?.sales?.growth);
  const usersGrowth = formatPercent(metrics?.users?.growth);

  return (
  <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4">
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-6 p-2 sm:p-4">

        {/* ================= METRICS CARDS ================= */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL SALES */}
          <div className="rounded-xl bg-muted/60 backdrop-blur p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Total Sales</h3>
              <DollarSign size={16} />
            </div>

            <div className="mt-2">
              <p className="text-2xl font-bold">
                ₹{metrics?.sales?.total ?? 0}
              </p>

              <span className={`flex items-center gap-1 text-xs font-semibold ${salesGrowth.color}`}>
                <salesGrowth.Icon size={14} />
                {salesGrowth.text} from last month
              </span>
            </div>
          </div>

          {/* THIS MONTH SALES */}
          <div className="rounded-xl bg-muted/60 backdrop-blur p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">This Month</h3>
              <CreditCard size={16} />
            </div>

            <div className="mt-2">
              <p className="text-2xl font-bold">
                ₹{metrics?.sales?.thisMonth ?? 0}
              </p>

              <span className={`flex items-center gap-1 text-xs ${salesGrowth.color}`}>
                <salesGrowth.Icon size={14} />
                {salesGrowth.text} from last month
              </span>
            </div>
          </div>

          {/* USERS */}
          <div className="rounded-xl bg-muted/60 backdrop-blur p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Users</h3>
              <Users size={16} />
            </div>

            <div className="mt-2">
              <p className="text-2xl font-bold">
                {metrics?.users?.count ?? 0}
              </p>

              <span className={`flex items-center gap-1 text-xs ${usersGrowth.color}`}>
                <usersGrowth.Icon size={14} />
                {usersGrowth.text} from last month
              </span>
            </div>
          </div>

          {/* ACTIVE NOW */}
          <div className="rounded-xl bg-muted/60 backdrop-blur p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Active Now</h3>
              <Activity size={16} />
            </div>

            <div className="mt-2">
              <p className="text-2xl font-bold">
                {metrics?.activeNow?.count ?? 0}
              </p>

              <p className="text-xs text-muted-foreground">
                Orders in last 1 hour
              </p>
            </div>
          </div>
        </div>

        {/* ================= CHARTS ================= */}
        <div className="flex flex-col gap-6">

          <div className="w-full min-h-[320px] sm:min-h-[380px]">
            <ComboSalesChart data={metrics} />
          </div>

          <div className="w-full min-h-[300px] sm:min-h-[360px]">
            <LineSalesChart data={metrics} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryPieChart data={metrics} />
            <RecentSales sales={metrics?.recentSales} />
          </div>

        </div>
      </div>
    </SidebarInset>
  </div>
);

};

export default Analytics;
const RecentSales = ({ sales = [] }) => {
  return (
    <div className="bg-muted/60 backdrop-blur rounded-xl p-4 sm:p-6">
      <h3 className="font-bold text-lg sm:text-xl mb-4">
        Recent Sales
      </h3>

      <div className="flex flex-col divide-y divide-border/40">
        {sales.map((order) => (
          <div
            key={order._id}
            className="
              flex flex-col gap-2
              sm:flex-row sm:items-center sm:justify-between
              py-3 px-2 rounded-lg
              transition hover:bg-white/5 hover:shadow-sm
            "
          >
            {/* LEFT */}
            <div className="flex gap-3 items-center min-w-0">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {order?.userId?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="font-semibold capitalize leading-tight truncate">
                  {order?.userId?.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {order?.userId?.email}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex justify-between sm:block sm:text-right">
              <p className="font-semibold text-emerald-500">
                ₹{order?.totalAmount?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Order value
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

