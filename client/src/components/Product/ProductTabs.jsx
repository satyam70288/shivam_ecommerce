import { useState } from "react";
import { FileText, Grid, ListChecks, Package } from "lucide-react";

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description", icon: <FileText size={18} /> },
    { id: "specifications", label: "Specifications", icon: <Grid size={18} /> },
    { id: "features", label: "Features", icon: <ListChecks size={18} /> },
    { id: "details", label: "Details", icon: <Package size={18} /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      {/* Tab Headers */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 -mx-4 sm:mx-0 px-4 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === "description" && (
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {activeTab === "specifications" && product.specifications && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Section Title */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Product Specifications
              </h3>
            </div>

            {/* Column Headers */}
            <div
              className="grid grid-cols-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide
                    bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200"
            >
              <span>Specification</span>
              <span>Details</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 px-4 py-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "features" && product.features && (
          <ul className="space-y-3">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.dimensions && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Dimensions
                </h4>
                <div className="space-y-2">
                  {Object.entries(product.dimensions).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">
                        {key}:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.materials && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Materials
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
