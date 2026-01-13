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

  // Quick preset buttons
  const presets = [
    { label: '[-1, 1]', a: -1, b: 1 },
    { label: '[0, 1]', a: 0, b: 1 },
    { label: '[0, π]', a: 0, b: Math.PI },
    { label: '[-π, π]', a: -Math.PI, b: Math.PI }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Integration Interval [a, b]
      </label>

      <div className="flex gap-4 items-center">
        {/* Input A */}
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            Lower bound (a)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputA}
            onChange={(e) => handleChangeA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Separator */}
        <span className="text-gray-400 text-xl mt-5">to</span>

        {/* Input B */}
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            Upper bound (b)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputB}
            onChange={(e) => handleChangeB(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Preset buttons */}
      <div className="mt-3">
        <span className="text-xs text-gray-500 mr-2">Quick presets:</span>
        {presets.map((preset, i) => (
          <button
            key={i}
            onClick={() => {
              onChangeA(preset.a);
              onChangeB(preset.b);
              setError('');
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-100 rounded mr-1 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Current interval display */}
      <div className="mt-3 text-center text-sm text-gray-600">
        Integrating over [{valueA.toFixed(3)}, {valueB.toFixed(3)}]
        <span className="text-gray-400 ml-2">
          (width: {(valueB - valueA).toFixed(3)})
        </span>
      </div>
    </div>
  );
}

export default IntervalSliders;
