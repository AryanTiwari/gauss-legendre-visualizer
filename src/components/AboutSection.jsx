/**
 * About Section Component
 *
 * Collapsible educational content for each quadrature method.
 * Uses KaTeX for LaTeX math rendering.
 */

import { useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { QUADRATURE_METHODS, METHOD_IDS } from '../utils/quadrature/index.js';

// Helper to render LaTeX inline
function Latex({ children, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        throwOnError: false,
        displayMode: display
      });
    } catch {
      return children;
    }
  }, [children, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// Helper component for mixed text with LaTeX
function MathText({ children }) {
  // Split on $...$ patterns for inline math
  const parts = children.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1);
          return <Latex key={i}>{latex}</Latex>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const EDUCATIONAL_CONTENT = {
  gaussLegendre: {
    title: 'Gauss-Legendre Quadrature',
    formulaLatex: 'x_i = \\text{roots of } P_n(x), \\quad w_i = \\frac{2}{(1-x_i^2)[P_n\'(x_i)]^2}',
    explanation:
      'Gauss-Legendre is the gold standard for polynomial quadrature. ' +
      'By placing nodes at the roots of Legendre polynomials $P_n(x)$, it achieves ' +
      'the highest possible algebraic degree of exactness: an $n$-point rule ' +
      'integrates polynomials of degree up to $2n-1$ exactly. This means it ' +
      'uses every degree of freedom ($n$ nodes + $n$ weights = $2n$ parameters) optimally.',
    convergence:
      'For smooth (analytic) functions, convergence is exponential: ' +
      'the error decreases as $O(\\rho^{-2n})$ for some $\\rho > 1$ depending on the analyticity region. ' +
      'This makes it far superior to equally spaced rules for smooth integrands.',
    keyFacts: [
      'Exact for polynomials up to degree $2n-1$',
      'Nodes are symmetric about the origin',
      'All weights $w_i > 0$ and $\\sum w_i = 2$',
      'Optimal among all $n$-point quadrature rules'
    ]
  },
  equallySpaced: {
    title: 'Trapezoidal (Composite Trapezoid)',
    formulaLatex: 'x_i = -1 + \\frac{2i}{n-1}, \\quad w_0 = w_{n-1} = \\frac{h}{2}, \\quad w_i = h \\text{ (interior)}',
    explanation:
      'The composite trapezoid rule divides the interval into equal subintervals ' +
      'and approximates the integral as the sum of trapezoids. While simple ' +
      'and intuitive, it is less efficient than Gauss-Legendre because the node ' +
      'positions are fixed rather than optimized.',
    convergence:
      'Error is $O(h^2)$ where $h = 2/(n-1)$ is the spacing. For smooth periodic ' +
      'functions, convergence can be surprisingly fast (exponential). However, ' +
      'for general smooth functions, the algebraic convergence $O(n^{-2})$ is much slower ' +
      'than Gauss-Legendre.',
    keyFacts: [
      'Exact only for linear functions (degree $1$)',
      'Error is $O(h^2) = O(n^{-2})$ for smooth functions',
      'Simple to understand and implement',
      'Suffers from Runge phenomenon at high $n$ for interpolation'
    ]
  },
  chebyshev: {
    title: 'Chebyshev (Clenshaw-Curtis) Quadrature',
    formulaLatex: 'x_j = \\cos\\left(\\frac{j\\pi}{n}\\right), \\quad j = 0, 1, \\ldots, n',
    explanation:
      'Clenshaw-Curtis quadrature uses Chebyshev points (extrema of Chebyshev polynomials $T_n(x)$) ' +
      'as nodes. These nodes cluster near the endpoints of $[-1, 1]$ with the optimal ' +
      'density for polynomial approximation. Although it only integrates polynomials ' +
      'of degree $n$ exactly (compared to $2n-1$ for Gauss-Legendre), a remarkable result ' +
      'from Trefethen (2008) shows that in practice, both methods achieve nearly the same accuracy.',
    convergence:
      'The surprising near-equivalence with Gauss-Legendre is explained by aliasing: ' +
      'on the Chebyshev grid, $T_{n+p}(x_j) = T_{n-p}(x_j)$, ' +
      'and since both have small integrals, the quadrature errors remain small. ' +
      'Theorem 5.1 proves that Clenshaw-Curtis has the same algebraic ' +
      'convergence rate $O((2n)^{-k})$ as Gauss for $k$-times differentiable functions.',
    keyFacts: [
      'Nearly identical accuracy to Gauss-Legendre in practice',
      'Nodes cluster near endpoints with density $\\frac{n}{\\pi\\sqrt{1-x^2}}$',
      'Efficiently computable via FFT in $O(n \\log n)$ operations',
      'Aliasing of Chebyshev coefficients explains unexpected accuracy'
    ],
    reference: 'Trefethen, L.N. (2008). "Is Gauss Quadrature Better than Clenshaw-Curtis?" SIAM Review 50(1):67-87.'
  },
  random: {
    title: 'Random (Monte Carlo Style)',
    formulaLatex: 'x_i \\sim \\text{Uniform}(-1, 1), \\quad w_i = \\frac{2}{n}',
    explanation:
      'Random quadrature places nodes at random positions, providing a baseline ' +
      'comparison against structured methods. With equal weights $w_i = 2/n$, this is ' +
      'essentially a Monte Carlo estimator scaled to the interval. It demonstrates ' +
      'why carefully chosen node placement (as in Gauss-Legendre) matters.',
    convergence:
      'Expected error is $O(1/\\sqrt{n})$, which is much slower than any ' +
      'structured quadrature method. The error also varies between runs ' +
      '(different seeds give different accuracy). This makes random placement ' +
      'a useful educational contrast to show the value of mathematical optimization.',
    keyFacts: [
      'Convergence $O(n^{-1/2})$ — much slower than structured methods',
      'Not exact for any polynomial degree $> 0$',
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
    <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/80 dark:border-gray-700 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        About the Methods
      </h2>

      <div className="space-y-2">
        {METHOD_IDS.map((methodId) => {
          const method = QUADRATURE_METHODS[methodId];
          const content = EDUCATIONAL_CONTENT[methodId];
          const isExpanded = expandedMethod === methodId;

          return (
            <div key={methodId}>
              <button
                onClick={() => toggle(methodId)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: method.color }}
                />
                <span className="text-base font-medium text-gray-700 dark:text-gray-300 flex-1">
                  {content.title}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 space-y-3">
                  <div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded p-3 overflow-x-auto">
                    <Latex display>{content.formulaLatex}</Latex>
                  </div>

                  <p className="leading-relaxed">
                    <MathText>{content.explanation}</MathText>
                  </p>

                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Convergence:</strong>
                    <p className="mt-1 leading-relaxed">
                      <MathText>{content.convergence}</MathText>
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-900 dark:text-gray-100">Key properties:</strong>
                    <ul className="mt-1.5 space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                      {content.keyFacts.map((fact, i) => (
                        <li key={i}><MathText>{fact}</MathText></li>
                      ))}
                    </ul>
                  </div>

                  {content.reference && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <strong className="text-gray-900 dark:text-gray-100">Reference:</strong>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                        {content.reference}
                      </p>
                    </div>
                  )}
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
