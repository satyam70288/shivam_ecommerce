const SizeSelector = ({ sizes, value, onChange }) => {
  if (!sizes?.length) return null;

  return (
    <div className="py-5 border-b">
      <h3 className="font-bold">Choose Size</h3>
      <div className="flex gap-3 mt-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-4 py-2 border rounded-md ${
              value === s ? "border-orange-500 bg-orange-100" : ""
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
