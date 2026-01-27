/**
 * Results Panel Component
 *
 * Displays:
 * 1. Integral notation
 * 2. Comparison table across all enabled methods
 * 3. Tabbed detail view for nodes/weights per method
 * 4. Formula explanation
 */

import { useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { QUADRATURE_METHODS, METHOD_IDS } from '../utils/quadrature/index.js';

export function ResultsPanel({
  allResults,
  enabledMethods,
  expression,
  intervalA,
  intervalB,
  degree,
  referenceValue,
  onToggle,
  functionValidation
}) {
  const [detailTab, setDetailTab] = useState('gaussLegendre');

  // Keep detail tab in sync with enabled methods
  const activeDetailTab = enabledMethods.includes(detailTab) ? detailTab : enabledMethods[0];

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

  const functionInvalid = functionValidation && !functionValidation.valid;

  // Function not integrable on interval
  if (functionInvalid) {
    return (
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
        {/* Integral Notation */}
        <div className="text-center dark:text-white">
          <div
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: integralLatex }}
          />
        </div>

        {/* Warning */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Cannot compute quadrature
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                {functionValidation.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No results
  if (!allResults) {
    return (
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Enter a valid function to see results
        </p>
      </div>
    );
  }

  const activeResult = allResults[activeDetailTab];

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
      {/* Integral Notation */}
      <div className="text-center dark:text-white">
        <div
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: integralLatex }}
        />
        {/* Reference value */}
        {referenceValue !== null && isFinite(referenceValue) && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Reference Value (Adaptive Quadrature)
            </p>
            <div className="text-xl font-semibold text-gray-700 dark:text-gray-200 font-mono">
              {referenceValue.toFixed(8)}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Method Comparison
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm dark:text-gray-300">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left">Method</th>
                <th className="px-3 py-2 text-right">Integral</th>
                <th className="px-3 py-2 text-right">Error</th>
              </tr>
            </thead>
            <tbody>
              {METHOD_IDS.map((methodId, i) => {
                const method = QUADRATURE_METHODS[methodId];
                const isEnabled = enabledMethods.includes(methodId);
                const result = allResults?.[methodId];

                const error = (referenceValue !== null && result)
                  ? Math.abs(result.integral - referenceValue)
                  : null;

                return (
                  <tr
                    key={methodId}
                    onClick={() => onToggle(methodId)}
                    className={`cursor-pointer transition-colors ${
                      i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                    } ${!isEnabled ? 'opacity-40' : ''} hover:bg-gray-100 dark:hover:bg-gray-600`}
                  >
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 border-2"
                          style={{
                            backgroundColor: isEnabled ? method.color : 'transparent',
                            borderColor: method.color
                          }}
                        />
                        <span className="font-medium">{method.shortName}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {!isEnabled
                        ? '—'
                        : result?.hasInvalidValues
                          ? <span className="text-red-500">NaN</span>
                          : result && isFinite(result.integral)
                            ? result.integral.toFixed(8)
                            : '—'
                      }
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      {!isEnabled
                        ? '—'
                        : error !== null && isFinite(error)
                          ? error < 1e-15
                            ? <span className="text-green-600 dark:text-green-400">&lt; 10⁻¹⁵</span>
                            : error.toExponential(2)
                          : '—'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 text-center">
          Click a method to toggle it on or off
        </p>
      </div>

      {/* Detail Tabs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Quadrature Details
        </h3>

        {/* Tab buttons */}
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {enabledMethods.map((methodId) => {
            const method = QUADRATURE_METHODS[methodId];
            const isActive = methodId === activeDetailTab;

            return (
              <button
                key={methodId}
                onClick={() => setDetailTab(methodId)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={isActive ? { backgroundColor: method.color } : undefined}
              >
                {method.shortName}
              </button>
            );
          })}
        </div>

        {/* Detail table for active method */}
        {activeResult && activeResult.details && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm dark:text-gray-300">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-2 py-1 text-left">i</th>
                  <th className="px-2 py-1 text-right">&#958;&#7522; (std)</th>
                  <th className="px-2 py-1 text-right">w&#7522;</th>
                  <th className="px-2 py-1 text-right">f(x&#7522;)</th>
                  <th className="px-2 py-1 text-right">w&#7522;&middot;f(x&#7522;)</th>
                </tr>
              </thead>
              <tbody>
                {activeResult.details.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                  >
                    <td className="px-2 py-1 text-gray-600 dark:text-gray-400">{row.index}</td>
                    <td className="px-2 py-1 text-right font-mono text-xs">
                      {row.originalNode.toFixed(6)}
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-xs">
                      {row.transformedWeight.toFixed(6)}
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-xs">
                      {isFinite(row.fValue) ? row.fValue.toFixed(6) : 'NaN'}
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-xs font-medium"
                      style={{ color: QUADRATURE_METHODS[activeDetailTab]?.color }}
                    >
                      {isFinite(row.contribution) ? row.contribution.toFixed(6) : 'NaN'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium" style={{
                  backgroundColor: QUADRATURE_METHODS[activeDetailTab]
                    ? `${QUADRATURE_METHODS[activeDetailTab].color}15`
                    : undefined
                }}>
                  <td colSpan="4" className="px-2 py-1 text-right">
                    Sum (Integral):
                  </td>
                  <td className="px-2 py-1 text-right font-mono"
                    style={{ color: QUADRATURE_METHODS[activeDetailTab]?.color }}
                  >
                    {isFinite(activeResult.integral) ? activeResult.integral.toFixed(6) : 'NaN'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Formula explanation */}
      <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
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
          where &#958;&#7522; are the quadrature nodes on [-1, 1] and w&#7522; are the corresponding weights.
          Different methods choose different nodes and weights.
        </p>
      </div>
    </div>
  );
}

export default ResultsPanel;
