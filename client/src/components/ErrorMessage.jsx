export default function ErrorMessage({ message, onRetry }) {
  return (
    <div
      className="
        max-w-md mx-auto mt-6 p-6 rounded-xl 
        border border-red-300 bg-red-50 text-red-700 
        shadow-sm text-center flex flex-col items-center gap-3
        animate-[fadeIn_0.4s_ease-out]

        dark:bg-red-900/20 dark:border-red-700 dark:text-red-300
      "
    >
      <div className="text-3xl animate-pulse">⚠️</div>

      <h3 className="text-lg font-semibold">Something went wrong</h3>

      <p className="text-sm opacity-80">
        {message || "An unexpected error occurred."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="
            mt-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200
            bg-red-600 text-white hover:bg-red-700 

            dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-800
          "
        >
          Retry
        </button>
      )}
    </div>
  );
}
