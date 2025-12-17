import { Circle } from "lucide-react";

const ColorSelector = ({ colors, value, onChange }) => {
  if (!colors?.length) return null;

  return (
    <div className="py-5 border-b">
      <h3 className="font-bold">Choose Color</h3>
      <div className="flex gap-3 mt-2">
        {colors.map((c) => (
          <Circle
            key={c}
            fill={c}
            size={36}
            onClick={() => onChange(c)}
            className={`cursor-pointer ${
              value === c ? "ring-2 ring-orange-400" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
