/**
 * Function Input Component with LaTeX Preview
 *
 * Allows users to input mathematical expressions with real-time LaTeX preview
 */

import { useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { toLatex, EXAMPLE_FUNCTIONS, SUPPORTED_FUNCTIONS } from '../utils/mathParser';

export function FunctionInput({
  value,
  onChange,
  isValid,
  error
}) {
  const [showExamples, setShowExamples] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    <div className="bg-white rounded-lg shadow-md p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Function f(x)
      </label>

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., x^2 + sin(x)"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            isValid
              ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              : 'border-red-300 focus:ring-red-500 focus:border-red-500'
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
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* LaTeX preview */}
      {value && latexPreview && (
        <div
          className="mt-3 p-3 bg-gray-50 rounded-lg text-center"
          dangerouslySetInnerHTML={{ __html: latexPreview }}
        />
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          {showExamples ? 'Hide examples' : 'Show examples'}
        </button>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          {showHelp ? 'Hide help' : 'Supported functions'}
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
                setShowExamples(false);
              }}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-indigo-100 rounded-lg text-left transition-colors"
            >
              <span className="font-mono">{ex.expr}</span>
              <span className="text-gray-500 ml-2">({ex.label})</span>
            </button>
          ))}
        </div>
      )}

      {/* Help section */}
      {showHelp && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-2">
            Supported Functions & Constants
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {SUPPORTED_FUNCTIONS.map((fn, i) => (
              <div key={i} className="text-gray-600">
                <code className="text-indigo-600">{fn.name}</code>
                <span className="text-gray-400 ml-1">- {fn.description}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Use standard operators: + - * / ^ ( )
          </p>
        </div>
      )}
    </div>
  );
}

export default FunctionInput;
