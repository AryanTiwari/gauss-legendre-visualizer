/**
 * Chebyshev Quadrature (Fejér's First Rule)
 *
 * Nodes are roots of Chebyshev polynomials of the first kind:
 *   xi = cos((2k - 1) * pi / (2n))  for k = 1, ..., n
 *
 * Weights are computed using Fejér's first rule, which provides optimal
 * weights for integrating f(x) directly using Chebyshev nodes.
 *
 * Key properties:
 *   - Minimizes Runge phenomenon (unlike equally spaced)
 *   - Near-optimal for polynomial interpolation
 *   - Exact for polynomials up to degree n-1
 *   - Exponential convergence for analytic functions (similar to Gauss-Legendre)
 */

/**
 * Get Chebyshev nodes and Clenshaw-Curtis weights on [-1, 1]
 */
export function getNodesAndWeights(n) {
  if (n < 1 || n > 10) {
    throw new Error(`Degree must be between 1 and 10, got ${n}`);
  }

  // Chebyshev nodes of the first kind
  const nodes = [];
  for (let k = 1; k <= n; k++) {
    nodes.push(Math.cos((2 * k - 1) * Math.PI / (2 * n)));
  }

  // Sort nodes from left to right for consistency
  nodes.sort((a, b) => a - b);

  // Compute Fejér first rule weights for these nodes
  const weights = computeFejerWeights(nodes, n);

  return { nodes, weights };
}

/**
 * Compute Fejér first rule weights for Chebyshev nodes of the first kind.
 *
 * For nodes x_k = cos((2k-1)π/(2n)), the weights are:
 *   w_k = (2/n) * [1 - 2 * sum_{j=1}^{floor((n-1)/2)} cos(2j*θ_k) / (4j² - 1)]
 * where θ_k = arccos(x_k) = (2k-1)π/(2n).
 *
 * This rule is exact for polynomials up to degree n-1 and exhibits
 * exponential convergence for analytic functions.
 */
function computeFejerWeights(nodes, n) {
  const weights = [];
  const maxJ = Math.floor((n - 1) / 2);

  for (let k = 1; k <= n; k++) {
    const theta = (2 * k - 1) * Math.PI / (2 * n);
    let w = 1;
    for (let j = 1; j <= maxJ; j++) {
      w -= (2 / (4 * j * j - 1)) * Math.cos(2 * j * theta);
    }
    weights.push((2 / n) * w);
  }

  // Reverse to match sorted nodes (original k=n is smallest, k=1 is largest)
  weights.reverse();

  return weights;
}

/**
 * Evaluate the Chebyshev polynomial T_n(x) using the recurrence relation
 *   T_0(x) = 1
 *   T_1(x) = x
 *   T_{n+1}(x) = 2x * T_n(x) - T_{n-1}(x)
 */
export function evaluateChebyshev(n, x) {
  if (n === 0) return 1;
  if (n === 1) return x;

  let t0 = 1;
  let t1 = x;

  for (let k = 1; k < n; k++) {
    const t2 = 2 * x * t1 - t0;
    t0 = t1;
    t1 = t2;
  }

  return t1;
}
