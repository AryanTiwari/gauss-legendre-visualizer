/**
 * Custom hook for managing Gauss-Legendre quadrature state and computation
 */

import { useState, useMemo, useCallback } from 'react';
import { computeQuadrature, estimateError } from '../utils/gaussLegendre';
import { parseFunction, isLikelyPolynomial } from '../utils/mathParser';

export function useQuadrature(initialExpression = 'x^2', initialDegree = 3, initialA = -1, initialB = 1) {
  // State
  const [expression, setExpression] = useState(initialExpression);
  const [degree, setDegree] = useState(initialDegree);
  const [intervalA, setIntervalA] = useState(initialA);
  const [intervalB, setIntervalB] = useState(initialB);

  // Parse the function expression
  const parsedFunction = useMemo(() => {
    return parseFunction(expression);
  }, [expression]);

  // Compute quadrature results
  const results = useMemo(() => {
    if (!parsedFunction.success || !parsedFunction.fn) {
      return null;
    }

    // Validate interval
    if (intervalA >= intervalB) {
      return { error: 'Lower bound must be less than upper bound' };
    }

    try {
      const quadResult = computeQuadrature(parsedFunction.fn, intervalA, intervalB, degree);

      // Check if any f(x) values are NaN or Infinity
      const hasInvalidValues = quadResult.details.some(
        d => !isFinite(d.fValue)
      );

      if (hasInvalidValues) {
        return {
          error: 'Function is undefined or infinite at some quadrature nodes',
          partial: quadResult
        };
      }

      // Estimate error if possible
      let errorEstimate = null;
      if (degree < 10) {
        errorEstimate = estimateError(parsedFunction.fn, intervalA, intervalB, degree);
      }

      // Check if result might be exact (polynomial case)
      const mightBeExact = isLikelyPolynomial(expression) &&
                          getPolynomialDegree(expression) <= 2 * degree - 1;

      return {
        ...quadResult,
        errorEstimate,
        mightBeExact
      };
    } catch (err) {
      return { error: err.message || 'Computation failed' };
    }
  }, [parsedFunction, intervalA, intervalB, degree, expression]);

  // Update handlers with validation
  const updateDegree = useCallback((n) => {
    const clamped = Math.max(1, Math.min(10, parseInt(n) || 1));
    setDegree(clamped);
  }, []);

  const updateIntervalA = useCallback((a) => {
    const val = parseFloat(a);
    if (!isNaN(val)) {
      setIntervalA(val);
    }
  }, []);

  const updateIntervalB = useCallback((b) => {
    const val = parseFloat(b);
    if (!isNaN(val)) {
      setIntervalB(val);
    }
  }, []);

  return {
    // State
    expression,
    degree,
    intervalA,
    intervalB,

    // Derived
    parsedFunction,
    results,
    isValid: parsedFunction.success && results && !results.error,

    // Setters
    setExpression,
    setDegree: updateDegree,
    setIntervalA: updateIntervalA,
    setIntervalB: updateIntervalB
  };
}

/**
 * Heuristic to estimate polynomial degree from expression
 * @param {string} expression
 * @returns {number}
 */
function getPolynomialDegree(expression) {
  const matches = expression.match(/x\^(\d+)/g);
  if (!matches) {
    // Check if x appears without exponent
    if (/x/.test(expression)) {
      return 1;
    }
    return 0;
  }

  let maxDegree = 0;
  for (const match of matches) {
    const exp = parseInt(match.replace('x^', ''));
    if (exp > maxDegree) {
      maxDegree = exp;
    }
  }

  return maxDegree;
}

export default useQuadrature;
