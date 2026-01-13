/**
 * Degree Selector Component
 *
 * Allows selection of quadrature degree (1-10) with visual feedback
 */

export function DegreeSelector({ value, onChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quadrature Degree (n)
      </label>

      {/* Slider */}
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />

      {/* Degree labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span
            key={n}
            className={n === value ? 'text-indigo-600 font-bold' : ''}
          >
            {n}
          </span>
        ))}
      </div>

      {/* Current selection display */}
      <div className="mt-3 text-center">
        <span className="text-3xl font-bold text-indigo-600">{value}</span>
        <span className="text-gray-500 ml-2">
          {value === 1 ? 'point' : 'points'}
        </span>
      </div>

      {/* Info text */}
      <p className="mt-2 text-xs text-gray-500 text-center">
        Gauss-Legendre with n points is exact for polynomials up to degree {2 * value - 1}
      </p>
    </div>
  );
}

export default DegreeSelector;
