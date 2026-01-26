/**
 * Degree Selector Component
 *
 * Allows selection of quadrature degree (1-10) with visual feedback
 */

export function DegreeSelector({ value, onChange }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Quadrature Degree (n)
      </label>

      {/* Slider */}
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />

      {/* Degree labels - px-1 compensates for slider thumb width */}
      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400 px-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span
            key={n}
            className={`w-4 text-center ${n === value ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""}`}
          >
            {n}
          </span>
        ))}
      </div>

      {/* Current selection display */}
      <div className="mt-3 text-center">
        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">
          {value === 1 ? "point" : "points"}
        </span>
      </div>

      {/* Info text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Number of quadrature nodes for all methods
      </p>
    </div>
  );
}

export default DegreeSelector;
