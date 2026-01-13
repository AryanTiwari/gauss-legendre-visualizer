/**
 * Results Panel Component
 *
 * Displays the computed integral, quadrature nodes/weights table,
 * and error estimation
 */

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function ResultsPanel({
  results,
  expression,
  intervalA,
  intervalB,
  degree
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

  // Handle no results
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-500 text-center">
          Enter a valid function to see results
        </p>
      </div>
    );
  }

  // Handle error
  if (results.error && !results.partial) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-red-600 text-center">
          <p className="font-medium">Computation Error</p>
          <p className="text-sm">{results.error}</p>
        </div>
      </div>
    );
  }

  const { integral, details, errorEstimate, mightBeExact } = results.partial || results;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Integral Result */}
      <div className="text-center">
        <div
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: integralLatex }}
        />

        {/* Quadrature Approximation */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Quadrature Approximation
          </p>
          <div className="text-3xl font-bold text-indigo-600">
            {isFinite(integral) ? integral.toFixed(8) : 'undefined'}
          </div>
        </div>

        {/* Accuracy indicator */}
        {mightBeExact && (
          <p className="text-sm text-green-600 mt-2">
            This is likely the exact value (polynomial degree ≤ {2 * degree - 1})
          </p>
        )}
        {errorEstimate !== null && !mightBeExact && (
          <p className="text-sm text-gray-500 mt-2">
            Estimated error: ±{errorEstimate.toExponential(2)}
          </p>
        )}
      </div>

      {/* Warning for partial results */}
      {results.error && results.partial && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
          Warning: {results.error}
        </div>
      )}

      {/* Nodes and Weights Table */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">
          Quadrature Details (n = {degree})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
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
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-2 py-1 text-gray-600">{row.index}</td>
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
                  <td className="px-2 py-1 text-right font-mono text-xs font-medium text-indigo-600">
                    {isFinite(row.contribution) ? row.contribution.toFixed(6) : 'NaN'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 font-medium">
                <td colSpan="5" className="px-2 py-1 text-right">
                  Sum (Integral):
                </td>
                <td className="px-2 py-1 text-right font-mono text-indigo-600">
                  {isFinite(integral) ? integral.toFixed(6) : 'NaN'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Formula explanation */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <p>
          <strong>Formula:</strong> The integral is approximated as
        </p>
        <div
          className="mt-1"
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
