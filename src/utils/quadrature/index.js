/**
 * Unified Quadrature Method Registry
 *
 * Provides a single interface for all quadrature methods,
 * plus shared computation utilities.
 */

import * as gaussLegendre from './gaussLegendre.js';
import * as equallySpaced from './equallySpaced.js';
import * as chebyshev from './chebyshev.js';
import * as random from './random.js';

export { evaluateLegendre } from './gaussLegendre.js';
export { evaluateChebyshev } from './chebyshev.js';

/**
 * Registry of all quadrature methods.
 */
export const QUADRATURE_METHODS = {
  gaussLegendre: {
    id: 'gaussLegendre',
    name: 'Gauss-Legendre',
    shortName: 'Gauss-Leg.',
    color: '#6366f1',
    getNodesAndWeights: (n) => gaussLegendre.getNodesAndWeights(n),
    description: 'Optimal polynomial quadrature using roots of Legendre polynomials as nodes.',
    properties: [
      'n points exact for polynomials up to degree 2n-1',
      'Nodes are roots of Legendre polynomial Pn(x)',
      'Weights are positive and sum to 2',
      'Exponential convergence for smooth functions'
    ]
  },
  equallySpaced: {
    id: 'equallySpaced',
    name: 'Equally Spaced',
    shortName: 'Equi-Spaced',
    color: '#10b981',
    getNodesAndWeights: (n) => equallySpaced.getNodesAndWeights(n),
    description: 'Composite trapezoid rule with uniformly distributed nodes.',
    properties: [
      'Exact for linear functions (degree 1)',
      'Error is O(h\u00B2) where h is the node spacing',
      'Simple to implement and understand',
      'Suffers from Runge phenomenon at high n'
    ]
  },
  chebyshev: {
    id: 'chebyshev',
    name: 'Chebyshev',
    shortName: 'Chebyshev',
    color: '#f59e0b',
    getNodesAndWeights: (n) => chebyshev.getNodesAndWeights(n),
    description: 'Clenshaw-Curtis quadrature using Chebyshev polynomial roots.',
    properties: [
      'Nodes cluster near endpoints, reducing interpolation error',
      'Avoids Runge phenomenon (unlike equally spaced)',
      'Near-optimal for polynomial interpolation',
      'Exponential convergence for analytic functions'
    ]
  },
  random: {
    id: 'random',
    name: 'Random',
    shortName: 'Random',
    color: '#ef4444',
    getNodesAndWeights: (n, seed) => random.getNodesAndWeights(n, seed),
    description: 'Monte Carlo style quadrature with seeded random node placement.',
    properties: [
      'Convergence is O(1/\u221An) in expectation',
      'Not exact for any polynomial degree',
      'Useful baseline for comparing structured methods',
      'Seed provides reproducibility; reshuffle for new samples'
    ]
  }
};

/** Ordered list of method IDs for consistent iteration */
export const METHOD_IDS = ['gaussLegendre', 'equallySpaced', 'chebyshev', 'random'];

/**
 * Transform a node from [-1, 1] to [a, b]
 */
export function transformNode(xi, a, b) {
  return ((b - a) / 2) * xi + (a + b) / 2;
}

/**
 * Transform a weight from [-1, 1] to [a, b]
 */
export function transformWeight(wi, a, b) {
  return ((b - a) / 2) * wi;
}

/**
 * Compute quadrature for a given method.
 *
 * @param {string} methodId - One of METHOD_IDS
 * @param {function} f - Function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} n - Number of quadrature points (1-10)
 * @param {{ seed?: number }} options
 * @returns {{ integral: number, details: Array }}
 */
export function computeQuadrature(methodId, f, a, b, n, options = {}) {
  const method = QUADRATURE_METHODS[methodId];
  if (!method) {
    throw new Error(`Unknown quadrature method: ${methodId}`);
  }

  const { nodes, weights } = methodId === 'random'
    ? method.getNodesAndWeights(n, options.seed ?? 42)
    : method.getNodesAndWeights(n);

  let integral = 0;
  const details = [];

  for (let i = 0; i < n; i++) {
    const xi = nodes[i];
    const wi = weights[i];
    const x = transformNode(xi, a, b);
    const w = transformWeight(wi, a, b);
    const fVal = f(x);
    const contribution = w * fVal;

    integral += contribution;

    details.push({
      index: i + 1,
      originalNode: xi,
      transformedNode: x,
      originalWeight: wi,
      transformedWeight: w,
      fValue: fVal,
      contribution
    });
  }

  return { integral, details };
}

/**
 * Compute a high-accuracy reference value using adaptive Simpson's rule.
 * This provides near-machine-epsilon accuracy for smooth functions.
 */
export function computeReferenceValue(f, a, b) {
  return adaptiveSimpson(f, a, b, 1e-14, 30);
}

/**
 * Adaptive Simpson's rule with Richardson extrapolation.
 * Recursively subdivides the interval until the error estimate is below tolerance.
 */
function adaptiveSimpson(f, a, b, tol, maxDepth) {
  const fa = f(a);
  const fb = f(b);
  const m = (a + b) / 2;
  const fm = f(m);
  const whole = ((b - a) / 6) * (fa + 4 * fm + fb);
  return adaptiveSimpsonRecurse(f, a, b, fa, fb, fm, whole, tol, maxDepth, 0);
}

function adaptiveSimpsonRecurse(f, a, b, fa, fb, fm, whole, tol, maxDepth, depth) {
  const m = (a + b) / 2;
  const lm = (a + m) / 2;
  const rm = (m + b) / 2;
  const flm = f(lm);
  const frm = f(rm);
  const left = ((m - a) / 6) * (fa + 4 * flm + fm);
  const right = ((b - m) / 6) * (fm + 4 * frm + fb);
  const combined = left + right;
  const delta = combined - whole;

  if (depth >= maxDepth || Math.abs(delta) <= 15 * tol) {
    return combined + delta / 15;
  }

  return adaptiveSimpsonRecurse(f, a, m, fa, fm, flm, left, tol / 2, maxDepth, depth + 1) +
         adaptiveSimpsonRecurse(f, m, b, fm, fb, frm, right, tol / 2, maxDepth, depth + 1);
}

/**
 * Validate whether a function is integrable on [a, b].
 * Samples the function at many points and checks for NaN/Infinity.
 *
 * @param {function} f - Function to validate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateFunctionOnInterval(f, a, b) {
  const numSamples = 200;
  let nanCount = 0;
  let infCount = 0;
  const values = [];

  for (let i = 0; i <= numSamples; i++) {
    const x = a + (b - a) * i / numSamples;
    try {
      const y = f(x);
      values.push(y);
      if (isNaN(y)) {
        nanCount++;
      } else if (!isFinite(y)) {
        infCount++;
      }
    } catch {
      values.push(NaN);
      nanCount++;
    }
  }

  const totalSamples = numSamples + 1;
  const nanRatio = nanCount / totalSamples;

  if (nanRatio > 0.1) {
    return {
      valid: false,
      message: `Function is undefined on a large portion of [${a.toFixed(2)}, ${b.toFixed(2)}]. Adjust the interval to the function's domain.`
    };
  }

  if (infCount > 0) {
    return {
      valid: false,
      message: `Function has asymptotes or singularities on [${a.toFixed(2)}, ${b.toFixed(2)}]. The integral may not exist on this interval.`
    };
  }

  // Detect singularities that fall between sample points by looking for
  // extremely large magnitudes or rapid sign-changing spikes (characteristic
  // of poles like 1/x near x=0).
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (!isFinite(prev) || !isFinite(curr)) continue;

    // Adjacent values with opposite signs and both large → pole (e.g. 1/x near 0)
    if (prev * curr < 0 && Math.abs(prev) > 50 && Math.abs(curr) > 50) {
      return {
        valid: false,
        message: `Function appears to have an asymptote on [${a.toFixed(2)}, ${b.toFixed(2)}]. The integral may not exist on this interval.`
      };
    }

    // Huge magnitude ratio between adjacent finite samples → nearby singularity
    const absPrev = Math.abs(prev);
    const absCurr = Math.abs(curr);
    if (absPrev > 1 && absCurr > 1) {
      const ratio = absCurr > absPrev ? absCurr / absPrev : absPrev / absCurr;
      if (ratio > 1e6) {
        return {
          valid: false,
          message: `Function has a singularity or asymptote on [${a.toFixed(2)}, ${b.toFixed(2)}]. The integral may not exist on this interval.`
        };
      }
    }
  }

  // Also check endpoints and near-endpoints for boundary issues
  const eps = (b - a) * 1e-10;
  const boundaryPoints = [a, a + eps, b - eps, b];
  for (const x of boundaryPoints) {
    try {
      const y = f(x);
      if (!isFinite(y)) {
        return {
          valid: false,
          message: `Function is undefined or infinite at the boundary of [${a.toFixed(2)}, ${b.toFixed(2)}]. The integral may not converge.`
        };
      }
    } catch {
      return {
        valid: false,
        message: `Function cannot be evaluated at the boundary of [${a.toFixed(2)}, ${b.toFixed(2)}].`
      };
    }
  }

  return { valid: true };
}

/**
 * Compute convergence data: run each method for n=1..10 and measure error.
 *
 * @param {function} f
 * @param {number} a
 * @param {number} b
 * @param {string[]} methodIds
 * @param {number} randomSeed
 * @returns {{ referenceValue: number, data: Record<string, Array<{ n, integral, error }>> }}
 */
export function computeConvergenceData(f, a, b, methodIds, randomSeed) {
  const referenceValue = computeReferenceValue(f, a, b);

  const data = {};

  for (const methodId of methodIds) {
    data[methodId] = [];
    for (let n = 1; n <= 10; n++) {
      const options = methodId === 'random' ? { seed: randomSeed } : {};
      const result = computeQuadrature(methodId, f, a, b, n, options);
      const error = Math.abs(result.integral - referenceValue);
      data[methodId].push({ n, integral: result.integral, error });
    }
  }

  return { referenceValue, data };
}
