/**
 * Chebyshev Quadrature (Clenshaw-Curtis)
 *
 * Nodes are roots of Chebyshev polynomials of the first kind:
 *   xi = cos((2k - 1) * pi / (2n))  for k = 1, ..., n
 *
 * Weights are computed using Clenshaw-Curtis quadrature, which integrates
 * the interpolating polynomial through the Chebyshev nodes exactly.
 *
 * Key properties:
 *   - Minimizes Runge phenomenon (unlike equally spaced)
 *   - Near-optimal for polynomial interpolation
 *   - Exact for polynomials up to degree n-1
 *   - Exponential convergence for analytic functions
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

  // Compute Clenshaw-Curtis weights for these nodes
  const weights = computeClenshawCurtisWeights(nodes, n);

  return { nodes, weights };
}

/**
 * Compute Clenshaw-Curtis weights for given Chebyshev nodes.
 *
 * For Chebyshev nodes of the first kind, the weight for node xi is:
 *   wi = (2/n) * sum_{j=0}^{floor((n-1)/2)} bj * cos(2j * arccos(xi))
 * where bj = 1 - 1/(4j^2 - 1) summed appropriately.
 *
 * We use the direct Lagrange integration approach: compute the integral
 * of each Lagrange basis polynomial over [-1, 1].
 */
function computeClenshawCurtisWeights(nodes, n) {
  // For Chebyshev nodes of the first kind, use the weight formula:
  // w_k = (2/n) * sum_{j=0}^{n-1} (1/(1-4j^2)) * cos(j * (2k-1) * pi / n)
  // where the sum excludes terms where 4j^2 = 1 (never happens for integer j)

  const weights = [];

  for (let k = 1; k <= n; k++) {
    let w = 0;
    for (let j = 0; j < n; j++) {
      const factor = j === 0 ? 1 : 2;
      const cosArg = j * (2 * k - 1) * Math.PI / n;
      const denom = 1 - 4 * j * j;
      if (denom !== 0) {
        w += factor * Math.cos(cosArg) / denom;
      }
    }
    weights.push((2 / n) * w);
  }

  // Sort weights to match sorted nodes
  // Since we sorted nodes, we need to reverse the weight order
  // (nodes were cos((2k-1)pi/2n) for k=1..n, which decrease, then we sorted ascending)
  // The original k=n gives the smallest node, k=1 gives the largest
  // After sorting nodes ascending, weights should correspond in reverse
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
