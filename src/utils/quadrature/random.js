/**
 * Random Node Quadrature (Monte Carlo Style)
 *
 * Nodes are generated from a seeded PRNG and sorted for visualization.
 * Weights are equal: each wi = 2/n so they sum to 2 (the length of [-1,1]).
 *
 * Uses the Mulberry32 algorithm for reproducible pseudorandom numbers.
 *
 * Key properties:
 *   - Convergence is O(1/sqrt(n)) in expectation (Monte Carlo rate)
 *   - Not exact for any polynomial degree
 *   - Useful baseline to show how structured nodes outperform random placement
 *   - Seed provides reproducibility; reshuffle changes the seed
 */

/**
 * Mulberry32 seeded PRNG.
 * Returns a function that produces uniform random numbers in [0, 1).
 */
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Get random nodes and equal weights on [-1, 1]
 * @param {number} n - Number of nodes (1-10)
 * @param {number} seed - Integer seed for reproducibility
 */
export function getNodesAndWeights(n, seed = 42) {
  if (n < 1 || n > 10) {
    throw new Error(`Degree must be between 1 and 10, got ${n}`);
  }

  const rng = mulberry32(seed);

  const nodes = [];
  for (let i = 0; i < n; i++) {
    // Map [0, 1) to [-1, 1)
    nodes.push(-1 + 2 * rng());
  }

  // Sort for consistent visualization
  nodes.sort((a, b) => a - b);

  // Equal weights summing to 2
  const weights = Array(n).fill(2 / n);

  return { nodes, weights };
}
