/**
 * Function Input Component with LaTeX Preview
 *
 * Allows users to input mathematical expressions with real-time LaTeX preview
 */

import { useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { toLatex, EXAMPLE_FUNCTIONS } from '../utils/mathParser';

export function FunctionInput({
  value,
  onChange,
  isValid,
  error
}) {
  const [showExamples, setShowExamples] = useState(false);

  // Convert expression to LaTeX and render
  const latexPreview = useMemo(() => {
    if (!value) return '';

    try {
      const latex = toLatex(value);
      return katex.renderToString(`f(x) = ${latex}`, {
        throwOnError: false,
        displayMode: false
      });
    } catch {
      return '';
    }
  }, [value]);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Function f(x)
      </label>

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., x^2 + sin(x)"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
            isValid
              ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
              : 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
          }`}
        />
        {isValid && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            ✓
          </span>
        )}
      </div>

      {/* Error message */}
      {!isValid && error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* LaTeX preview */}
      {value && latexPreview && (
        <div
          className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center dark:text-white"
          dangerouslySetInnerHTML={{ __html: latexPreview }}
        />
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
        >
          {showExamples ? 'Hide examples' : 'Show examples'}
        </button>
      </div>

      {/* Example functions dropdown */}
      {showExamples && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {EXAMPLE_FUNCTIONS.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(ex.expr);
              }}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg text-left transition-colors dark:text-white"
            >
              <span className="font-mono">{ex.expr}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">({ex.label})</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

export default FunctionInput;
