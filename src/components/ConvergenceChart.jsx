/**
 * Convergence Chart Component
 *
 * Renders a log-scale error vs n chart using JSXGraph,
 * with one line per enabled quadrature method.
 */

import { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import { QUADRATURE_METHODS } from '../utils/quadrature/index.js';

/** Convert an integer exponent to a string with Unicode superscript: e.g. -16 → "10⁻¹⁶" */
function toSuperscript(n) {
  const sup = { '-': '\u207B', '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
    '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' };
  return '10' + String(n).split('').map(c => sup[c] || c).join('');
}

// Hook to detect dark mode (shared pattern)
function useDarkMode() {
  const getInitial = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  const ref = useRef(getInitial());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      ref.current = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return ref.current;
}

export function ConvergenceChart({ convergenceData, enabledMethods, isDarkMode }) {
  const containerRef = useRef(null);
  const boardRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !convergenceData) return;

    // Clean up existing board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const labelColor = isDarkMode ? '#e5e7eb' : '#374151';
    const bgText = isDarkMode ? '#d1d5db' : '#4b5563';

    // Fixed y-axis range: 10^-17 to 10^4
    const minLog = -17;
    const maxLog = 4;

    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: [-2.0, maxLog + 1.5, 11.5, minLog - 1.5],
      axis: false,
      showNavigation: false,
      showCopyright: false,
      pan: { enabled: false },
      zoom: { enabled: false },
      grid: false
    });

    boardRef.current = board;

    // Draw custom grid
    for (let n = 1; n <= 10; n++) {
      board.create('segment', [[n, minLog], [n, maxLog]], {
        strokeColor: isDarkMode ? '#374151' : '#e5e7eb',
        strokeWidth: 1,
        fixed: true,
        highlight: false
      });
      board.create('text', [n, minLog - 0.5, `${n}`], {
        fontSize: 12,
        color: axisColor,
        fixed: true,
        anchorX: 'middle'
      });
    }

    for (let y = Math.ceil(minLog); y <= Math.floor(maxLog); y++) {
      const isZeroLine = y === 0;
      board.create('segment', [[0.5, y], [10.5, y]], {
        strokeColor: isZeroLine
          ? (isDarkMode ? '#9ca3af' : '#6b7280')
          : (isDarkMode ? '#374151' : '#e5e7eb'),
        strokeWidth: isZeroLine ? 2.5 : 1,
        fixed: true,
        highlight: false
      });
      // Show labels at every 2nd power to avoid clutter
      if (y % 2 === 0) {
        board.create('text', [-0.3, y, toSuperscript(y)], {
          fontSize: 11,
          color: axisColor,
          fixed: true,
          anchorX: 'right'
        });
      }
    }

    // Prominent y-axis line
    board.create('segment', [[0.5, minLog], [0.5, maxLog]], {
      strokeColor: isDarkMode ? '#9ca3af' : '#374151',
      strokeWidth: 2,
      fixed: true,
      highlight: false
    });

    // Prominent x-axis line (bottom border)
    board.create('segment', [[0.5, minLog], [10.5, minLog]], {
      strokeColor: isDarkMode ? '#9ca3af' : '#374151',
      strokeWidth: 2,
      fixed: true,
      highlight: false
    });

    // Y-axis label (rotated)
    board.create('text', [-1.5, (minLog + maxLog) / 2, 'Error'], {
      fontSize: 13,
      color: bgText,
      fixed: true,
      anchorX: 'middle',
      rotate: 90
    });

    // X-axis label
    board.create('text', [5.5, minLog - 1, 'Number of points (n)'], {
      fontSize: 13,
      color: bgText,
      fixed: true,
      anchorX: 'middle'
    });

    // Plot each method's convergence line
    for (const methodId of enabledMethods) {
      const method = QUADRATURE_METHODS[methodId];
      const points = convergenceData.data[methodId];
      if (!points) continue;

      const validPoints = points
        .filter(p => p.error > 0)
        .map(p => [p.n, Math.log10(p.error)]);

      if (validPoints.length === 0) continue;

      // Draw line through points
      if (validPoints.length >= 2) {
        const xCoords = validPoints.map(p => p[0]);
        const yCoords = validPoints.map(p => p[1]);

        board.create('curve', [xCoords, yCoords], {
          strokeColor: method.color,
          strokeWidth: 2.5,
          highlight: false
        });
      }

      // Draw points
      for (const [x, y] of validPoints) {
        board.create('point', [x, y], {
          size: 3,
          color: method.color,
          name: '',
          fixed: true,
          highlight: false
        });
      }

      // Points where error is 0 (exact) - draw at bottom with special marker
      const exactPoints = points.filter(p => p.error === 0);
      for (const p of exactPoints) {
        board.create('point', [p.n, minLog + 0.3], {
          size: 4,
          color: method.color,
          name: '',
          fixed: true,
          highlight: false,
          face: 'diamond'
        });
      }
    }

    // Legend
    let legendY = maxLog - 0.3;
    for (const methodId of enabledMethods) {
      const method = QUADRATURE_METHODS[methodId];
      board.create('segment', [[7.5, legendY], [8.5, legendY]], {
        strokeColor: method.color,
        strokeWidth: 2.5,
        fixed: true,
        highlight: false
      });
      board.create('point', [8, legendY], {
        size: 2,
        color: method.color,
        name: '',
        fixed: true,
        highlight: false
      });
      board.create('text', [8.7, legendY, method.shortName], {
        fontSize: 11,
        color: method.color,
        fixed: true,
        anchorX: 'left'
      });
      legendY -= 0.7;
    }

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, [convergenceData, enabledMethods, isDarkMode]);

  if (!convergenceData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Enter a valid function to see convergence data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="jxgbox w-full"
      style={{ aspectRatio: '10/9', minHeight: '400px' }}
    />
  );
}

export default ConvergenceChart;
