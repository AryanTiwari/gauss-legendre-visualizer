/**
 * Random Controls Component
 *
 * Seed input and reshuffle button for the random quadrature method.
 */

export function RandomControls({ seed, onSeedChange, onReshuffle }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Random Method Controls
      </h2>

      <div className="space-y-3">
        {/* Seed input */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Seed (integer)
          </label>
          <input
            type="number"
            step="1"
            value={seed}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) onSeedChange(val);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
          />
        </div>

        {/* Reshuffle button */}
        <button
          onClick={onReshuffle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
        >
          {/* Shuffle icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reshuffle Nodes
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Same seed always produces the same nodes
        </p>
      </div>
    </div>
  );
}

export default RandomControls;
