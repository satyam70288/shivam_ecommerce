import { Minus, Plus } from "lucide-react";

const QuantitySelector = ({ value, onChange, max }) => {
  return (
    <div className="py-5 flex items-center gap-4">
      <div className="
        flex items-center gap-5 px-4 py-2 rounded-full
        bg-gray-100 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
      ">
        <Minus
          className="cursor-pointer text-gray-700 dark:text-gray-300
            hover:text-orange-500 dark:hover:text-orange-400"
          onClick={() => onChange(Math.max(1, value - 1))}
        />

        <span className="text-gray-900 dark:text-gray-100 font-medium">
          {value}
        </span>

        <Plus
          className="cursor-pointer text-gray-700 dark:text-gray-300
            hover:text-orange-500 dark:hover:text-orange-400"
          onClick={() => value < max && onChange(value + 1)}
        />
      </div>
    </div>
  );
};

export default QuantitySelector;
