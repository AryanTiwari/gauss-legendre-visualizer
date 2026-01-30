/**
 * Convergence Chart Component
 *
 * Renders a log-scale error vs n chart using JSXGraph,
 * with one line per enabled quadrature method.
 */

import { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import { QUADRATURE_METHODS } from '../utils/quadrature/index.js';

export function ConvergenceChart({ convergenceData, enabledMethods, isDarkMode, degree }) {
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

    // Fixed y-axis range: 10^-17 to 10^2
    const minLog = -17;
    const maxLog = 2;

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
        fontSize: 14,
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
      board.create('text', [-0.3, y, `10<sup>${y}</sup>`], {
        fontSize: 12,
        color: axisColor,
        fixed: true,
        anchorX: 'right',
        display: 'html'
      });
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
    board.create('text', [-1.3, (minLog + maxLog) / 2, 'Error'], {
      fontSize: 15,
      color: bgText,
      fixed: true,
      anchorX: 'middle',
      rotate: 90
    });

    // X-axis label
    board.create('text', [5.5, minLog - 1.3, 'Number of points (n)'], {
      fontSize: 15,
      color: bgText,
      fixed: true,
      anchorX: 'middle'
    });

    // Highlight current degree column
    if (degree >= 1 && degree <= 10) {
      board.create('polygon', [
        [degree - 0.4, minLog], [degree + 0.4, minLog],
        [degree + 0.4, maxLog], [degree - 0.4, maxLog]
      ], {
        fillColor: isDarkMode ? '#6366f1' : '#6366f1',
        fillOpacity: isDarkMode ? 0.12 : 0.08,
        strokeWidth: 0,
        fixed: true,
        highlight: false,
        vertices: { visible: false, fixed: true },
        hasInnerPoints: false
      });
      board.create('text', [degree, maxLog + 0.5, `n=${degree}`], {
        fontSize: 12,
        color: isDarkMode ? '#a5b4fc' : '#6366f1',
        fixed: true,
        anchorX: 'middle',
        fontWeight: 'bold'
      });
    }

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

    // Annotate current degree points with error values
    if (degree >= 1 && degree <= 10) {
      let labelOffset = 0;
      for (const methodId of enabledMethods) {
        const method = QUADRATURE_METHODS[methodId];
        const points = convergenceData.data[methodId];
        if (!points) continue;
        const pt = points.find(p => p.n === degree);
        if (!pt) continue;

        if (pt.error > 0) {
          const logErr = Math.log10(pt.error);
          // Larger highlighted point
          board.create('point', [degree, logErr], {
            size: 5,
            color: method.color,
            name: '',
            fixed: true,
            highlight: false,
            strokeColor: isDarkMode ? '#e5e7eb' : '#ffffff',
            strokeWidth: 2
          });
          // Error label
          board.create('text', [degree + 0.45, logErr + 0.3 + labelOffset, pt.error.toExponential(1)], {
            fontSize: 10,
            color: method.color,
            fixed: true,
            anchorX: 'left',
            fontWeight: 'bold'
          });
          labelOffset += 0.8;
        } else {
          // Exact — highlight diamond
          board.create('point', [degree, minLog + 0.3], {
            size: 6,
            color: method.color,
            name: '',
            fixed: true,
            highlight: false,
            face: 'diamond',
            strokeColor: isDarkMode ? '#e5e7eb' : '#ffffff',
            strokeWidth: 2
          });
        }
      }
    }

    // Legend (bottom-left)
    let legendY = minLog + 0.5 + enabledMethods.length * 0.8;
    for (const methodId of enabledMethods) {
      const method = QUADRATURE_METHODS[methodId];
      board.create('segment', [[1, legendY], [1.8, legendY]], {
        strokeColor: method.color,
        strokeWidth: 2.5,
        fixed: true,
        highlight: false
      });
      board.create('point', [1.4, legendY], {
        size: 2,
        color: method.color,
        name: '',
        fixed: true,
        highlight: false
      });
      board.create('text', [2.0, legendY, method.shortName], {
        fontSize: 11,
        color: method.color,
        fixed: true,
        anchorX: 'left'
      });
      legendY -= 0.8;
    }

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, [convergenceData, enabledMethods, isDarkMode, degree]);

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
