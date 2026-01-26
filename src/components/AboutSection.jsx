/**
 * About Section Component
 *
 * Collapsible educational content for each quadrature method.
 */

import { useState } from 'react';
import { QUADRATURE_METHODS, METHOD_IDS } from '../utils/quadrature/index.js';

const EDUCATIONAL_CONTENT = {
  gaussLegendre: {
    title: 'Gauss-Legendre Quadrature',
    formula: 'Nodes are roots of Pn(x), the Legendre polynomial of degree n.',
    explanation:
      'Gauss-Legendre is the gold standard for polynomial quadrature. ' +
      'By placing nodes at the roots of Legendre polynomials, it achieves ' +
      'the highest possible algebraic degree of exactness: an n-point rule ' +
      'integrates polynomials of degree up to 2n-1 exactly. This means it ' +
      'uses every degree of freedom (n nodes + n weights = 2n parameters) optimally.',
    convergence:
      'For smooth (analytic) functions, convergence is exponential: ' +
      'the error decreases faster than any polynomial in 1/n. ' +
      'This makes it far superior to equally spaced rules for smooth integrands.',
    keyFacts: [
      'Exact for polynomials up to degree 2n-1',
      'Nodes are symmetric about the origin',
      'All weights are positive and sum to 2',
      'Optimal among all n-point quadrature rules'
    ]
  },
  equallySpaced: {
    title: 'Equally Spaced (Composite Trapezoid)',
    formula: 'Nodes at xi = -1 + 2i/(n-1). Endpoint weights = h/2, interior = h.',
    explanation:
      'The composite trapezoid rule divides the interval into equal subintervals ' +
      'and approximates the integral as the sum of trapezoids. While simple ' +
      'and intuitive, it is less efficient than Gauss-Legendre because the node ' +
      'positions are fixed rather than optimized.',
    convergence:
      'Error is O(h^2) where h = 2/(n-1) is the spacing. For smooth periodic ' +
      'functions, convergence can be surprisingly fast (exponential). However, ' +
      'for general smooth functions, the algebraic convergence is much slower ' +
      'than Gauss-Legendre.',
    keyFacts: [
      'Exact only for linear functions (degree 1)',
      'Error is O(h^2) = O(1/n^2) for smooth functions',
      'Simple to understand and implement',
      'Suffers from Runge phenomenon at high n for interpolation'
    ]
  },
  chebyshev: {
    title: 'Chebyshev Quadrature',
    formula: 'Nodes at xi = cos((2k-1)pi/(2n)), roots of the Chebyshev polynomial Tn(x).',
    explanation:
      'Chebyshev quadrature uses Chebyshev polynomial roots as nodes. ' +
      'These nodes cluster near the endpoints of [-1, 1], which counteracts ' +
      'the Runge phenomenon that plagues equally spaced nodes. The weights are ' +
      'computed to integrate the interpolating polynomial exactly.',
    convergence:
      'For analytic functions, Chebyshev quadrature converges exponentially, ' +
      'often nearly as fast as Gauss-Legendre. The practical difference ' +
      'between Gauss-Legendre and Chebyshev is usually small, but ' +
      'Chebyshev has the advantage of nested point sets (useful for adaptive methods).',
    keyFacts: [
      'Nodes cluster near endpoints (reduces interpolation error)',
      'Avoids Runge phenomenon unlike equally spaced',
      'Near-optimal polynomial interpolation',
      'Exponential convergence for analytic functions'
    ]
  },
  random: {
    title: 'Random (Monte Carlo Style)',
    formula: 'Nodes sampled uniformly from [-1, 1] with equal weights wi = 2/n.',
    explanation:
      'Random quadrature places nodes at random positions, providing a baseline ' +
      'comparison against structured methods. With equal weights, this is ' +
      'essentially a Monte Carlo estimator scaled to the interval. It demonstrates ' +
      'why carefully chosen node placement (as in Gauss-Legendre) matters.',
    convergence:
      'Expected error is O(1/sqrt(n)), which is much slower than any ' +
      'structured quadrature method. The error also varies between runs ' +
      '(different seeds give different accuracy). This makes random placement ' +
      'a useful educational contrast to show the value of mathematical optimization.',
    keyFacts: [
      'Convergence O(1/sqrt(n)) — much slower than structured methods',
      'Not exact for any polynomial degree',
      'Error varies with seed (not deterministic accuracy)',
      'Useful baseline to demonstrate value of node optimization'
    ]
  }
};

export function AboutSection() {
  const [expandedMethod, setExpandedMethod] = useState(null);

  const toggle = (methodId) => {
    setExpandedMethod(prev => prev === methodId ? null : methodId);
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        About the Methods
      </h2>

      <div className="space-y-1">
        {METHOD_IDS.map((methodId) => {
          const method = QUADRATURE_METHODS[methodId];
          const content = EDUCATIONAL_CONTENT[methodId];
          const isExpanded = expandedMethod === methodId;

          return (
            <div key={methodId}>
              <button
                onClick={() => toggle(methodId)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: method.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                  {content.title}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 text-xs text-gray-600 dark:text-gray-300 space-y-2">
                  <p className="font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                    {content.formula}
                  </p>

                  <p>{content.explanation}</p>

                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Convergence:</strong>
                    <p className="mt-0.5">{content.convergence}</p>
                  </div>

                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Key properties:</strong>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside text-gray-600 dark:text-gray-400">
                      {content.keyFacts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AboutSection;
