/**
 * Interval Sliders Component
 *
 * Numeric inputs for integration bounds [a, b]
 */

import { useState, useEffect } from 'react';

export function IntervalSliders({
  valueA,
  valueB,
  onChangeA,
  onChangeB
}) {
  // Local state for input values (allows typing incomplete values)
  const [inputA, setInputA] = useState(valueA.toString());
  const [inputB, setInputB] = useState(valueB.toString());
  const [error, setError] = useState('');

  // Sync local state with props
  useEffect(() => {
    setInputA(valueA.toFixed(2));
  }, [valueA]);

  useEffect(() => {
    setInputB(valueB.toFixed(2));
  }, [valueB]);

  const handleChangeA = (val) => {
    setInputA(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num >= valueB) {
        setError('a must be less than b');
      } else {
        setError('');
        onChangeA(num);
      }
    }
  };

  const handleChangeB = (val) => {
    setInputB(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num <= valueA) {
        setError('b must be greater than a');
      } else {
        setError('');
        onChangeB(num);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Integration Interval [a, b]
      </label>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
        {/* Input A */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Lower (a)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputA}
            onChange={(e) => handleChangeA(e.target.value)}
            className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-mono"
          />
        </div>

        {/* Separator */}
        <span className="text-gray-400 dark:text-gray-500 text-lg pb-2">to</span>

        {/* Input B */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Upper (b)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputB}
            onChange={(e) => handleChangeB(e.target.value)}
            className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-mono"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Hint about dragging */}
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Tip: You can also drag the a and b points on the graph
      </p>
    </div>
  );
}

export default IntervalSliders;
