/**
 * Gauss-Legendre Quadrature Implementation
 *
 * Provides pre-computed nodes and weights for Gauss-Legendre quadrature
 * of degrees 1-10, plus utilities for computing integrals.
 */

// Pre-computed Gauss-Legendre nodes and weights for degrees 1-10
// Nodes are roots of Legendre polynomials on [-1, 1]
// Weights satisfy: wi = 2 / [(1 - xi²) × (P'n(xi))²]
const PRECOMPUTED = {
  1: {
    nodes: [0],
    weights: [2]
  },
  2: {
    nodes: [-0.5773502691896257, 0.5773502691896257],
    weights: [1, 1]
  },
  3: {
    nodes: [-0.7745966692414834, 0, 0.7745966692414834],
    weights: [0.5555555555555556, 0.8888888888888888, 0.5555555555555556]
  },
  4: {
    nodes: [
      -0.8611363115940526,
      -0.3399810435848563,
      0.3399810435848563,
      0.8611363115940526
    ],
    weights: [
      0.3478548451374538,
      0.6521451548625461,
      0.6521451548625461,
      0.3478548451374538
    ]
  },
  5: {
    nodes: [
      -0.9061798459386640,
      -0.5384693101056831,
      0,
      0.5384693101056831,
      0.9061798459386640
    ],
    weights: [
      0.2369268850561891,
      0.4786286704993665,
      0.5688888888888889,
      0.4786286704993665,
      0.2369268850561891
    ]
  },
  6: {
    nodes: [
      -0.9324695142031521,
      -0.6612093864662645,
      -0.2386191860831969,
      0.2386191860831969,
      0.6612093864662645,
      0.9324695142031521
    ],
    weights: [
      0.1713244923791704,
      0.3607615730481386,
      0.4679139345726910,
      0.4679139345726910,
      0.3607615730481386,
      0.1713244923791704
    ]
  },
  7: {
    nodes: [
      -0.9491079123427585,
      -0.7415311855993945,
      -0.4058451513773972,
      0,
      0.4058451513773972,
      0.7415311855993945,
      0.9491079123427585
    ],
    weights: [
      0.1294849661688697,
      0.2797053914892766,
      0.3818300505051189,
      0.4179591836734694,
      0.3818300505051189,
      0.2797053914892766,
      0.1294849661688697
    ]
  },
  8: {
    nodes: [
      -0.9602898564975363,
      -0.7966664774136267,
      -0.5255324099163290,
      -0.1834346424956498,
      0.1834346424956498,
      0.5255324099163290,
      0.7966664774136267,
      0.9602898564975363
    ],
    weights: [
      0.1012285362903763,
      0.2223810344533745,
      0.3137066458778873,
      0.3626837833783620,
      0.3626837833783620,
      0.3137066458778873,
      0.2223810344533745,
      0.1012285362903763
    ]
  },
  9: {
    nodes: [
      -0.9681602395076261,
      -0.8360311073266358,
      -0.6133714327005904,
      -0.3242534234038089,
      0,
      0.3242534234038089,
      0.6133714327005904,
      0.8360311073266358,
      0.9681602395076261
    ],
    weights: [
      0.0812743883615744,
      0.1806481606948574,
      0.2606106964029354,
      0.3123470770400029,
      0.3302393550012598,
      0.3123470770400029,
      0.2606106964029354,
      0.1806481606948574,
      0.0812743883615744
    ]
  },
  10: {
    nodes: [
      -0.9739065285171717,
      -0.8650633666889845,
      -0.6794095682990244,
      -0.4333953941292472,
      -0.1488743389816312,
      0.1488743389816312,
      0.4333953941292472,
      0.6794095682990244,
      0.8650633666889845,
      0.9739065285171717
    ],
    weights: [
      0.0666713443086881,
      0.1494513491505806,
      0.2190863625159820,
      0.2692667193099963,
      0.2955242247147529,
      0.2955242247147529,
      0.2692667193099963,
      0.2190863625159820,
      0.1494513491505806,
      0.0666713443086881
    ]
  }
};

/**
 * Get Gauss-Legendre nodes and weights for a given degree
 * @param {number} n - Degree (1-10)
 * @returns {{nodes: number[], weights: number[]}}
 */
export function getNodesAndWeights(n) {
  if (n < 1 || n > 10) {
    throw new Error(`Degree must be between 1 and 10, got ${n}`);
  }
  return PRECOMPUTED[n];
}

/**
 * Transform a node from [-1, 1] to [a, b]
 * @param {number} xi - Node on [-1, 1]
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @returns {number} Transformed node
 */
export function transformNode(xi, a, b) {
  return ((b - a) / 2) * xi + (a + b) / 2;
}

/**
 * Transform a weight from [-1, 1] to [a, b]
 * @param {number} wi - Weight on [-1, 1]
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @returns {number} Transformed weight
 */
export function transformWeight(wi, a, b) {
  return ((b - a) / 2) * wi;
}

/**
 * Compute the Gauss-Legendre quadrature approximation of an integral
 * @param {function} f - Function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} n - Quadrature degree (1-10)
 * @returns {{
 *   integral: number,
 *   details: Array<{
 *     index: number,
 *     originalNode: number,
 *     transformedNode: number,
 *     originalWeight: number,
 *     transformedWeight: number,
 *     fValue: number,
 *     contribution: number
 *   }>
 * }}
 */
export function computeQuadrature(f, a, b, n) {
  const { nodes, weights } = getNodesAndWeights(n);

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
      contribution: contribution
    });
  }

  return { integral, details };
}

/**
 * Estimate error by comparing results of degree n and n+1
 * @param {function} f - Function to integrate
 * @param {number} a - Lower bound
 * @param {number} b - Upper bound
 * @param {number} n - Quadrature degree (1-9)
 * @returns {number} Estimated error
 */
export function estimateError(f, a, b, n) {
  if (n >= 10) {
    return null; // Cannot estimate for n=10
  }

  const result1 = computeQuadrature(f, a, b, n);
  const result2 = computeQuadrature(f, a, b, n + 1);

  return Math.abs(result2.integral - result1.integral);
}

/**
 * Evaluate the Legendre polynomial P_n(x) using the recurrence relation
 * P_0(x) = 1
 * P_1(x) = x
 * P_{n+1}(x) = ((2n+1)·x·P_n(x) - n·P_{n-1}(x)) / (n+1)
 *
 * @param {number} n - Polynomial degree (0-10)
 * @param {number} x - Point to evaluate at
 * @returns {number} Value of P_n(x)
 */
export function evaluateLegendre(n, x) {
  if (n === 0) return 1;
  if (n === 1) return x;

  let p0 = 1;
  let p1 = x;

  for (let k = 1; k < n; k++) {
    const p2 = ((2 * k + 1) * x * p1 - k * p0) / (k + 1);
    p0 = p1;
    p1 = p2;
  }

  return p1;
}

export default {
  getNodesAndWeights,
  transformNode,
  transformWeight,
  computeQuadrature,
  estimateError,
  evaluateLegendre
};
