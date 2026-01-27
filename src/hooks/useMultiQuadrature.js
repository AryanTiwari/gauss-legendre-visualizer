/**
 * Custom hook for managing multi-method quadrature state and computation.
 *
 * Extends the original useQuadrature pattern to support comparing
 * multiple quadrature methods simultaneously.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  QUADRATURE_METHODS,
  METHOD_IDS,
  computeQuadrature,
  computeConvergenceData,
  computeReferenceValue,
  validateFunctionOnInterval
} from '../utils/quadrature/index.js';
import { parseFunction, isLikelyPolynomial } from '../utils/mathParser';

export function useMultiQuadrature(
  initialExpression = 'sin(x)',
  initialDegree = 4,
  initialA = 0,
  initialB = Math.PI
) {
  // Core state
  const [expression, setExpression] = useState(initialExpression);
  const [degree, setDegree] = useState(initialDegree);
  const [intervalA, setIntervalA] = useState(initialA);
  const [intervalB, setIntervalB] = useState(initialB);

  // Multi-method state
  const [enabledMethods, setEnabledMethods] = useState([...METHOD_IDS]);
  const [randomSeed, setRandomSeed] = useState(42);
  const [activeMethod, setActiveMethod] = useState('gaussLegendre');

  // Parse the function expression
  const parsedFunction = useMemo(() => {
    return parseFunction(expression);
  }, [expression]);

  // Validate interval
  const intervalValid = intervalA < intervalB;

  // Validate function on interval (check for NaN, asymptotes, etc.)
  const functionValidation = useMemo(() => {
    if (!parsedFunction.success || !parsedFunction.fn || !intervalValid) {
      return { valid: true }; // Don't show validation error if expression/interval is already invalid
    }
    return validateFunctionOnInterval(parsedFunction.fn, intervalA, intervalB);
  }, [parsedFunction, intervalA, intervalB, intervalValid]);

  // Compute results for all enabled methods
  const allResults = useMemo(() => {
    if (!parsedFunction.success || !parsedFunction.fn || !intervalValid) {
      return null;
    }
    if (!functionValidation.valid) {
      return null;
    }

    const results = {};

    try {
      for (const methodId of enabledMethods) {
        const options = methodId === 'random' ? { seed: randomSeed } : {};
        const result = computeQuadrature(methodId, parsedFunction.fn, intervalA, intervalB, degree, options);

        const hasInvalidValues = result.details.some(d => !isFinite(d.fValue));

        results[methodId] = {
          ...result,
          hasInvalidValues,
          error: hasInvalidValues
            ? 'Function is undefined or infinite at some quadrature nodes'
            : null
        };
      }
    } catch (err) {
      return null;
    }

    return results;
  }, [parsedFunction, intervalA, intervalB, degree, enabledMethods, randomSeed, intervalValid]);

  // Reference value (n=10 Gauss-Legendre)
  const referenceValue = useMemo(() => {
    if (!parsedFunction.success || !parsedFunction.fn || !intervalValid || !functionValidation.valid) {
      return null;
    }
    try {
      return computeReferenceValue(parsedFunction.fn, intervalA, intervalB);
    } catch {
      return null;
    }
  }, [parsedFunction, intervalA, intervalB, intervalValid, functionValidation]);

  // Convergence data (error vs n for each method)
  const convergenceData = useMemo(() => {
    if (!parsedFunction.success || !parsedFunction.fn || !intervalValid || !functionValidation.valid) {
      return null;
    }
    try {
      return computeConvergenceData(
        parsedFunction.fn, intervalA, intervalB, enabledMethods, randomSeed
      );
    } catch {
      return null;
    }
  }, [parsedFunction, intervalA, intervalB, enabledMethods, randomSeed, intervalValid, functionValidation]);

  // Update handlers with validation
  const updateDegree = useCallback((n) => {
    const clamped = Math.max(1, Math.min(10, parseInt(n) || 1));
    setDegree(clamped);
  }, []);

  const updateIntervalA = useCallback((a) => {
    const val = parseFloat(a);
    if (!isNaN(val)) setIntervalA(val);
  }, []);

  const updateIntervalB = useCallback((b) => {
    const val = parseFloat(b);
    if (!isNaN(val)) setIntervalB(val);
  }, []);

  const reshuffleRandom = useCallback(() => {
    setRandomSeed(Math.floor(Math.random() * 100) + 1);
  }, []);

  const toggleMethod = useCallback((methodId) => {
    setEnabledMethods(prev => {
      if (prev.includes(methodId)) {
        // Don't allow disabling all methods
        if (prev.length <= 1) return prev;
        const next = prev.filter(id => id !== methodId);
        // If we disabled the active method, switch to first remaining
        if (methodId === activeMethod) {
          setActiveMethod(next[0]);
        }
        return next;
      }
      return METHOD_IDS.filter(id => prev.includes(id) || id === methodId);
    });
  }, [activeMethod]);

  return {
    // Core state
    expression,
    degree,
    intervalA,
    intervalB,

    // Parsed
    parsedFunction,

    // Multi-method state
    enabledMethods,
    randomSeed,
    activeMethod,

    // Computed
    allResults,
    referenceValue,
    convergenceData,
    functionValidation,
    isValid: parsedFunction.success && intervalValid && functionValidation.valid && allResults !== null,

    // Setters
    setExpression,
    setDegree: updateDegree,
    setIntervalA: updateIntervalA,
    setIntervalB: updateIntervalB,
    setEnabledMethods,
    setRandomSeed,
    setActiveMethod,
    toggleMethod,
    reshuffleRandom
  };
}
