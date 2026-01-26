/**
 * Math Parser Utility
 *
 * Wraps math.js for safe expression evaluation with support for
 * common mathematical functions.
 */

import { compile, evaluate, parse } from 'mathjs';

// Supported functions documentation
export const SUPPORTED_FUNCTIONS = [
  { name: 'sin(x)', description: 'Sine function' },
  { name: 'cos(x)', description: 'Cosine function' },
  { name: 'tan(x)', description: 'Tangent function' },
  { name: 'asin(x)', description: 'Inverse sine' },
  { name: 'acos(x)', description: 'Inverse cosine' },
  { name: 'atan(x)', description: 'Inverse tangent' },
  { name: 'exp(x)', description: 'Exponential (e^x)' },
  { name: 'log(x)', description: 'Natural logarithm' },
  { name: 'log10(x)', description: 'Base-10 logarithm' },
  { name: 'sqrt(x)', description: 'Square root' },
  { name: 'abs(x)', description: 'Absolute value' },
  { name: 'x^n', description: 'Power (e.g., x^2)' },
  { name: 'pi', description: 'π ≈ 3.14159...' },
  { name: 'e', description: 'Euler\'s number ≈ 2.71828...' }
];

// Example functions for quick selection
export const EXAMPLE_FUNCTIONS = [
  { expr: 'x^2', label: 'x²', latex: 'x^2' },
  { expr: 'x^3', label: 'x³', latex: 'x^3' },
  { expr: 'sin(x)', label: 'sin(x)', latex: '\\sin(x)' },
  { expr: 'cos(x)', label: 'cos(x)', latex: '\\cos(x)' },
  { expr: 'exp(x)', label: 'eˣ', latex: 'e^x' },
  { expr: 'exp(-x^2)', label: 'e⁻ˣ²', latex: 'e^{-x^2}' },
  { expr: '1/(1+x^2)', label: '1/(1+x²)', latex: '\\frac{1}{1+x^2}' },
  { expr: 'sqrt(1-x^2)', label: '√(1-x²)', latex: '\\sqrt{1-x^2}' },
  { expr: 'sin(x)*cos(x)', label: 'sin(x)cos(x)', latex: '\\sin(x)\\cos(x)' },
  { expr: 'x*sin(x)', label: 'x·sin(x)', latex: 'x\\sin(x)' }
];

/**
 * Parse a mathematical expression and return a compiled function
 * @param {string} expression - Mathematical expression (e.g., "x^2 + sin(x)")
 * @returns {{ success: boolean, fn?: function, error?: string }}
 */
export function parseFunction(expression) {
  if (!expression || expression.trim() === '') {
    return { success: false, error: 'Expression cannot be empty' };
  }

  try {
    const compiled = compile(expression);

    // Test evaluation to catch errors early
    const testValue = compiled.evaluate({ x: 1 });
    if (typeof testValue !== 'number' || !isFinite(testValue)) {
      // Allow it but warn - some functions may be undefined at x=1
    }

    // Return a function that evaluates at a given x
    const fn = (x) => {
      try {
        const result = compiled.evaluate({ x });
        return typeof result === 'number' ? result : NaN;
      } catch {
        return NaN;
      }
    };

    return { success: true, fn };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to parse expression'
    };
  }
}

/**
 * Evaluate a function at a specific point
 * @param {function} fn - Compiled function
 * @param {number} x - Point to evaluate at
 * @returns {number} Result (may be NaN if undefined)
 */
export function evaluateAt(fn, x) {
  try {
    return fn(x);
  } catch {
    return NaN;
  }
}

/**
 * Convert a math expression to a LaTeX string using mathjs's built-in parser.
 * This handles all cases correctly including negative exponents (e^-x).
 * @param {string} expression - Math expression
 * @returns {string} LaTeX string
 */
export function toLatex(expression) {
  if (!expression) return '';

  try {
    const node = parse(expression);
    return node.toTex({ parenthesis: 'keep', implicit: 'hide' });
  } catch {
    return expression;
  }
}

/**
 * Check if a function is likely a polynomial of given maximum degree
 * This is a heuristic check based on the expression string
 * @param {string} expression - Math expression
 * @param {number} maxDegree - Maximum polynomial degree to check
 * @returns {boolean}
 */
export function isLikelyPolynomial(expression, maxDegree = 19) {
  const nonPolynomialPatterns = [
    /sin|cos|tan|exp|log|sqrt|abs/,
    /\^[^0-9]/, // Non-integer exponents
    /\^\d{2,}/ // Exponents with 2+ digits
  ];

  for (const pattern of nonPolynomialPatterns) {
    if (pattern.test(expression)) {
      return false;
    }
  }

  // Check for polynomial-like pattern
  const polynomialPattern = /^[\d\s\+\-\*x\^\.()]+$/;
  return polynomialPattern.test(expression);
}

export default {
  parseFunction,
  evaluateAt,
  toLatex,
  isLikelyPolynomial,
  SUPPORTED_FUNCTIONS,
  EXAMPLE_FUNCTIONS
};
