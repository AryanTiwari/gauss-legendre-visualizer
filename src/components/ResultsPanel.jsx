/**
 * Results Panel Component
 *
 * Displays the computed integral, quadrature nodes/weights table,
 * and error estimation
 */

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { computeQuadrature } from '../utils/gaussLegendre';

export function ResultsPanel({
  results,
  expression,
  intervalA,
  intervalB,
  degree,
  parsedFn
}) {
  // Render the integral notation
  const integralLatex = useMemo(() => {
    if (!expression) return '';

    try {
      const a = intervalA.toFixed(2);
      const b = intervalB.toFixed(2);
      return katex.renderToString(
        `\\int_{${a}}^{${b}} f(x) \\, dx`,
        { throwOnError: false, displayMode: true }
      );
    } catch {
      return '';
    }
  }, [expression, intervalA, intervalB]);

  // Compute reference value using n=10 quadrature (highest available)
  const referenceValue = useMemo(() => {
    if (!parsedFn) return null;
    try {
      const result = computeQuadrature(parsedFn, intervalA, intervalB, 10);
      return result.integral;
    } catch {
      return null;
    }
  }, [parsedFn, intervalA, intervalB]);

  // Handle no results
  if (!results) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Enter a valid function to see results
        </p>
      </div>
    );
  }

  // Handle error
  if (results.error && !results.partial) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="font-medium">Computation Error</p>
          <p className="text-sm">{results.error}</p>
        </div>
      </div>
    );
  }

  const { integral, details, errorEstimate, mightBeExact } = results.partial || results;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
      {/* Integral Result */}
      <div className="text-center dark:text-white">
        <div
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: integralLatex }}
        />

        {/* Values comparison */}
        <div className="mt-3 grid grid-cols-2 gap-4">
          {/* Reference Value (n=10) */}
          <div className="border-r border-gray-200 dark:border-gray-600 pr-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Reference Value (n=10)
            </p>
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              {referenceValue !== null && isFinite(referenceValue)
                ? referenceValue.toFixed(8)
                : 'undefined'}
            </div>
          </div>

          {/* Quadrature Approximation */}
          <div className="pl-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Your Approximation (n={degree})
            </p>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {isFinite(integral) ? integral.toFixed(8) : 'undefined'}
            </div>
          </div>
        </div>

        {/* Accuracy indicator */}
        {mightBeExact && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-3">
            This is likely the exact value (polynomial degree ≤ {2 * degree - 1})
          </p>
        )}
        {errorEstimate !== null && !mightBeExact && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Estimated error: ±{errorEstimate.toExponential(2)}
          </p>
        )}
        {degree === 10 && !mightBeExact && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Using maximum available degree (n=10)
          </p>
        )}
      </div>

      {/* Warning for partial results */}
      {results.error && results.partial && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded p-2 text-sm text-yellow-800 dark:text-yellow-200">
          Warning: {results.error}
        </div>
      )}

      {/* Nodes and Weights Table */}
      <div>
        <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
          Quadrature Details (n = {degree})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm dark:text-gray-300">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-2 py-1 text-left">i</th>
                <th className="px-2 py-1 text-right">ξᵢ (std)</th>
                <th className="px-2 py-1 text-right">xᵢ (trans)</th>
                <th className="px-2 py-1 text-right">wᵢ</th>
                <th className="px-2 py-1 text-right">f(xᵢ)</th>
                <th className="px-2 py-1 text-right">wᵢ·f(xᵢ)</th>
              </tr>
            </thead>
            <tbody>
              {details?.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                >
                  <td className="px-2 py-1 text-gray-600 dark:text-gray-400">{row.index}</td>
                  <td className="px-2 py-1 text-right font-mono text-xs">
                    {row.originalNode.toFixed(6)}
                  </td>
                  <td className="px-2 py-1 text-right font-mono text-xs">
                    {row.transformedNode.toFixed(6)}
                  </td>
                  <td className="px-2 py-1 text-right font-mono text-xs">
                    {row.transformedWeight.toFixed(6)}
                  </td>
                  <td className="px-2 py-1 text-right font-mono text-xs">
                    {isFinite(row.fValue) ? row.fValue.toFixed(6) : 'NaN'}
                  </td>
                  <td className="px-2 py-1 text-right font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {isFinite(row.contribution) ? row.contribution.toFixed(6) : 'NaN'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 dark:bg-indigo-900/50 font-medium">
                <td colSpan="5" className="px-2 py-1 text-right">
                  Sum (Integral):
                </td>
                <td className="px-2 py-1 text-right font-mono text-indigo-600 dark:text-indigo-400">
                  {isFinite(integral) ? integral.toFixed(6) : 'NaN'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Formula explanation */}
      <div className="text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-600 pt-3">
        <p>
          <strong className="dark:text-gray-300">Formula:</strong> The integral is approximated as
        </p>
        <div
          className="mt-1 dark:text-white"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(
              `\\int_a^b f(x)\\,dx \\approx \\frac{b-a}{2} \\sum_{i=1}^{n} w_i \\cdot f\\left(\\frac{b-a}{2}\\xi_i + \\frac{a+b}{2}\\right)`,
              { throwOnError: false, displayMode: false }
            )
          }}
        />
        <p className="mt-2">
          where ξᵢ are the standard Legendre nodes on [-1, 1] and wᵢ are the corresponding weights.
        </p>
      </div>
    </div>
  );
}

export default ResultsPanel;
