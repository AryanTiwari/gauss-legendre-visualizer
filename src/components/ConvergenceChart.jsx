/**
 * Convergence Chart Component
 *
 * Renders a log-scale error vs n chart using JSXGraph,
 * with one line per enabled quadrature method.
 */

import { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import { QUADRATURE_METHODS } from '../utils/quadrature/index.js';

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

    // Determine y-axis range from data
    let minLog = 0;
    let maxLog = 0;
    for (const methodId of enabledMethods) {
      const points = convergenceData.data[methodId];
      if (!points) continue;
      for (const p of points) {
        if (p.error > 0) {
          const logErr = Math.log10(p.error);
          if (logErr < minLog) minLog = logErr;
          if (logErr > maxLog) maxLog = logErr;
        }
      }
    }

    // Pad the y range
    const yPad = Math.max(1, (maxLog - minLog) * 0.15);
    minLog = Math.floor(minLog - yPad);
    maxLog = Math.ceil(maxLog + yPad);

    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: [0, maxLog, 11, minLog],
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
      board.create('text', [n, minLog - 0.3, `${n}`], {
        fontSize: 12,
        color: axisColor,
        fixed: true,
        anchorX: 'middle'
      });
    }

    for (let y = Math.ceil(minLog); y <= Math.floor(maxLog); y++) {
      board.create('segment', [[0.5, y], [10.5, y]], {
        strokeColor: isDarkMode ? '#374151' : '#e5e7eb',
        strokeWidth: 1,
        fixed: true,
        highlight: false
      });
      board.create('text', [0.3, y, `10^${y}`], {
        fontSize: 11,
        color: axisColor,
        fixed: true,
        anchorX: 'right'
      });
    }

    // Axis labels
    board.create('text', [5.5, minLog - 0.8, 'Number of points (n)'], {
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
      style={{ aspectRatio: '1/1', minHeight: '400px' }}
    />
  );
}

export default ConvergenceChart;
