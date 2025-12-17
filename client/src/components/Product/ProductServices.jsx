import React from "react";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  PackageCheck,
  Headphones,
} from "lucide-react";

const ProductServices = ({ promises = [] }) => {
  /* ===============================
     ICON MAP (DB iconId → component)
     =============================== */
  const ICON_MAP = {
    truck: Truck,
    refresh: RotateCcw,
    shield: ShieldCheck,
    check: PackageCheck,
  };

  /* ===============================
     COLOR MAP (promise code → color)
     =============================== */
  const PROMISE_COLOR = {
    READY_TO_SHIP: "blue",
    EASY_RETURNS: "green",
    QUALITY_CHECKED: "orange",
    SECURE_PAYMENTS: "purple",
  };

  const COLOR_CLASSES = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400",
  };

  /* ===============================
     STATIC PLATFORM SERVICES
     =============================== */
  const STATIC_SERVICES = [
    {
      title: "Safe Packaging",
      desc: "Damage-proof packing",
      icon: PackageCheck,
      color: "gray",
    },
    {
      title: "Customer Support",
      desc: "7 days assistance",
      icon: Headphones,
      color: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* 🔥 Dynamic promises from DB */}
      {promises.map((p) => {
        const Icon = ICON_MAP[p.iconId];
        const color = PROMISE_COLOR[p.code] || "gray";

        if (!Icon) return null;

        return (
          <div
            key={p._id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4
                       hover:shadow-md transition"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className={`p-2.5 rounded-lg ${COLOR_CLASSES[color]}`}>
                <Icon className="w-5 h-5" />
              </div>

              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {p.title}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {p.description}
              </p>
            </div>
          </div>
        );
      })}

      {/* 🧱 Static platform services */}
      {STATIC_SERVICES.map((s) => (
        <div
          key={s.title}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4
                     hover:shadow-md transition"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`p-2.5 rounded-lg ${COLOR_CLASSES[s.color]}`}>
              <s.icon className="w-5 h-5" />
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {s.title}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {s.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductServices;
