/**
 * Gauss-Legendre Quadrature Visualization
 *
 * Interactive tool for visualizing numerical integration using
 * Gauss-Legendre quadrature method.
 */

import { useCallback } from 'react';
import { useQuadrature } from './hooks/useQuadrature';
import { Graph } from './components/Graph';
import { FunctionInput } from './components/FunctionInput';
import { DegreeSelector } from './components/DegreeSelector';
import { IntervalSliders } from './components/IntervalSliders';
import { ResultsPanel } from './components/ResultsPanel';

function App() {
  const {
    expression,
    degree,
    intervalA,
    intervalB,
    parsedFunction,
    results,
    isValid,
    setExpression,
    setDegree,
    setIntervalA,
    setIntervalB
  } = useQuadrature('sin(x)', 4, 0, Math.PI);

  // Handle interval changes from graph interaction
  const handleIntervalChange = useCallback((newA, newB) => {
    setIntervalA(newA);
    setIntervalB(newB);
  }, [setIntervalA, setIntervalB]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            Gauss-Legendre Quadrature Visualization
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Interactive numerical integration explorer
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-4">
            <FunctionInput
              value={expression}
              onChange={setExpression}
              isValid={parsedFunction.success}
              error={parsedFunction.error}
            />

            <DegreeSelector
              value={degree}
              onChange={setDegree}
            />

            <IntervalSliders
              valueA={intervalA}
              valueB={intervalB}
              onChangeA={setIntervalA}
              onChangeB={setIntervalB}
            />
          </div>

          {/* Right Column - Graph and Results */}
          <div className="lg:col-span-2 space-y-4">
            <Graph
              fn={parsedFunction.fn}
              intervalA={intervalA}
              intervalB={intervalB}
              quadratureDetails={results?.details}
              onIntervalChange={handleIntervalChange}
              isValid={isValid}
              degree={degree}
            />

            <ResultsPanel
              results={results}
              expression={expression}
              intervalA={intervalA}
              intervalB={intervalB}
              degree={degree}
            />
          </div>
        </div>

        {/* Educational Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            About Gauss-Legendre Quadrature
          </h2>
          <div className="prose prose-sm text-gray-600 max-w-none">
            <p>
              <strong>Gauss-Legendre quadrature</strong> is a numerical integration technique that
              approximates definite integrals with remarkable accuracy. Unlike simple methods like
              the trapezoidal rule or Simpson's rule which use equally-spaced points, Gauss-Legendre
              strategically places evaluation points (nodes) at the roots of Legendre polynomials.
            </p>
            <p className="mt-2">
              <strong>Key properties:</strong>
            </p>
            <ul className="mt-1 list-disc list-inside">
              <li>
                An n-point Gauss-Legendre formula exactly integrates polynomials up to degree 2n-1
              </li>
              <li>
                The nodes are symmetric about the origin on the standard interval [-1, 1]
              </li>
              <li>
                Weights are always positive and sum to 2 on [-1, 1]
              </li>
              <li>
                For smooth functions, convergence is typically exponential as n increases
              </li>
            </ul>
            <p className="mt-2">
              <strong>Visualization:</strong> The colored rectangles show how each quadrature point
              contributes to the integral. Each rectangle is centered at a node xᵢ, has width
              proportional to its weight wᵢ, and height equal to f(xᵢ). The sum of these rectangle
              areas approximates the integral.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p>
            Gauss-Legendre Quadrature Visualization | Built with React, JSXGraph, and KaTeX
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
