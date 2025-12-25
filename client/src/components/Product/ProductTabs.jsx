import { useState } from "react";
import { FileText, Grid, ListChecks, Package, ChevronDown, ChevronUp } from "lucide-react";

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [showFullDescription, setShowFullDescription] = useState(false);

  const tabs = [
    { id: "description", label: "Description", icon: <FileText size={18} /> },
    { id: "specifications", label: "Specifications", icon: <Grid size={18} /> },
    { id: "features", label: "Features", icon: <ListChecks size={18} /> },
    { id: "details", label: "Details", icon: <Package size={18} /> },
  ];

  // Safe HTML content
  const getDescription = () => {
    if (!product.description) return "";
    return { __html: product.description };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      {/* Tab Headers - Fixed scroll issue */}
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowFullDescription(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors relative flex-shrink-0 ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
                
                {/* Active indicator */}
                <div className={`absolute bottom-0 left-3 right-3 h-0.5 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "opacity-100 bg-blue-600 dark:bg-blue-500" 
                    : "opacity-0"
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {/* DESCRIPTION TAB */}
        {activeTab === "description" && (
          <div>
            <div 
              className={`prose prose-gray dark:prose-invert max-w-none overflow-hidden transition-all duration-300 ${
                showFullDescription ? "max-h-none" : "max-h-24"
              }`}
              dangerouslySetInnerHTML={getDescription()}
            />
            
            {/* Show More/Less Button - Always show if there's description */}
            {product.description && product.description.length > 300 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {showFullDescription ? (
                    <>
                      <ChevronUp size={18} />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} />
                      Show More
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* SPECIFICATIONS TAB */}
        {activeTab === "specifications" && product.specifications && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Product Specifications
              </h3>
            </div>

            <div className="grid grid-cols-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200">
              <span>Specification</span>
              <span>Details</span>
            </div>

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

        {/* FEATURES TAB */}
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

        {/* DETAILS TAB */}
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

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductTabs;