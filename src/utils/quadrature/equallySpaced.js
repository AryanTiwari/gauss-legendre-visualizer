/**
 * Equally Spaced Quadrature (Composite Trapezoid Rule)
 *
 * Nodes are uniformly distributed on [-1, 1].
 * Weights follow the composite trapezoid rule:
 *   - Endpoints get weight h/2
 *   - Interior points get weight h
 *   where h = 2/(n-1) is the spacing.
 *
 * For n=1, falls back to the midpoint rule (single node at 0, weight 2).
 *
 * Key property: exact for polynomials up to degree 1 (linear).
 * Error: O(h^2) for smooth functions.
 */

/**
 * Get equally spaced nodes and weights on [-1, 1]
 */
export function getNodesAndWeights(n) {
  if (n < 1 || n > 10) {
    throw new Error(`Degree must be between 1 and 10, got ${n}`);
  }

  // Special case: single point uses midpoint rule
  if (n === 1) {
    return { nodes: [0], weights: [2] };
  }

  const h = 2 / (n - 1);
  const nodes = [];
  const weights = [];

  for (let i = 0; i < n; i++) {
    nodes.push(-1 + i * h);
    // Trapezoid rule: half weight at endpoints, full weight inside
    weights.push(i === 0 || i === n - 1 ? h / 2 : h);
  }

  return { nodes, weights };
}
