

export default function NotFound({ title = "Not Found", message, icon }) {
  return (
    <div
      className="
        max-w-md mx-auto mt-14 p-8 rounded-2xl
        bg-gradient-to-b from-gray-50 to-white
        border border-gray-200 text-gray-700 shadow-md
        flex flex-col items-center gap-4 text-center
        
        dark:from-gray-800/60 dark:to-gray-900/40 
        dark:border-gray-700 dark:text-gray-300
        animate-[fadeIn_0.5s_ease-out]
      "
    >
      {/* Icon wrapper */}
      <div
        className="
          flex items-center justify-center
          text-gray-600 dark:text-gray-300
        "
      >
        {icon} {/* <<===== YAHAN SVG AYEGA */}
      </div>

      <h3 className="text-2xl font-bold tracking-wide">{title}</h3>

      <p className="text-sm opacity-80 leading-relaxed">
        {message || "We couldn’t find what you were looking for."}
      </p>

      <button
        className="
          mt-3 px-5 py-2 rounded-xl text-sm font-semibold
          bg-gray-800 text-white hover:bg-gray-900 transition-all
          dark:bg-gray-600 dark:hover:bg-gray-500
          shadow-sm
        "
      >
        Go Back
      </button>
    </div>
  );
}
